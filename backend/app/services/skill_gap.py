from typing import TypedDict

from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.database.connection import SessionLocal
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill_gap import SkillGap
from app.models.user import User
from app.models.user_skill import UserSkill
from app.schemas.user_skills import (
    SkillLevel,
    SkillStatus,
    normalize_skill_level,
    normalize_skill_status,
)


DIFFICULTY_WEIGHTS = {"beginner": 50, "intermediate": 75, "advanced": 100}
LEVEL_RANK = {
    SkillLevel.BEGINNER: 1,
    SkillLevel.INTERMEDIATE: 2,
    SkillLevel.ADVANCED: 3,
    SkillLevel.EXPERT: 4,
}
REQUIRED_LEVEL = {
    "beginner": SkillLevel.BEGINNER,
    "intermediate": SkillLevel.INTERMEDIATE,
    "advanced": SkillLevel.ADVANCED,
    "expert": SkillLevel.EXPERT,
}


class MissingSkill(TypedDict):
    id: int
    name: str
    importance: int
    difficulty: str | None
    priority_score: float
    priority: str


class SkillGapResult(TypedDict):
    id: int
    user_id: int
    role_id: int
    role: str
    overall_score: float
    missing_skills: list[MissingSkill]
    generated_at: str


class SkillGapAnalysis(TypedDict):
    user_id: int
    role_id: int
    role: str
    overall_score: float
    missing_skills: list[MissingSkill]


def _priority(importance: int, difficulty: str | None) -> tuple[float, str]:
    difficulty_weight = DIFFICULTY_WEIGHTS.get((difficulty or "").lower(), 1)
    score = round(importance * 0.7 + difficulty_weight * 0.3, 2)
    if score >= 80:
        label = "High"
    elif score >= 50:
        label = "Medium"
    else:
        label = "Low"
    return score, label


def _missing_skills(role: Role, user_skill_ids: set[int]) -> list[MissingSkill]:
    missing: list[MissingSkill] = []
    for requirement in role.role_skills:
        if requirement.skill_id in user_skill_ids:
            continue
        priority_score, priority = _priority(
            requirement.importance, requirement.skill.difficulty
        )
        missing.append(
            {
                "id": requirement.skill.id,
                "name": requirement.skill.name,
                "importance": requirement.importance,
                "difficulty": requirement.skill.difficulty,
                "priority_score": priority_score,
                "priority": priority,
            }
        )
    missing.sort(key=lambda item: (-item["priority_score"], item["name"]))
    return missing


def _required_level_rank(difficulty: str | None) -> int:
    level = REQUIRED_LEVEL.get((difficulty or "beginner").lower(), SkillLevel.BEGINNER)
    return LEVEL_RANK[level]


def _qualified_user_skills(user_skills: list[UserSkill]) -> dict[int, UserSkill]:
    qualified_statuses = {SkillStatus.COMPLETED, SkillStatus.MASTERED}
    return {
        item.skill_id: item
        for item in user_skills
        if normalize_skill_status(item.status) in qualified_statuses
    }


def _satisfied_skill_ids(role: Role, user_skills: list[UserSkill]) -> set[int]:
    completed_skills = _qualified_user_skills(user_skills)
    return {
        requirement.skill_id
        for requirement in role.role_skills
        if (user_skill := completed_skills.get(requirement.skill_id)) is not None
        and LEVEL_RANK[normalize_skill_level(user_skill.level)]
        >= _required_level_rank(requirement.skill.difficulty)
    }


def calculate_skill_gap_analysis(
    user_id: int, role_id: int, db: Session
) -> SkillGapAnalysis:
    user = db.scalar(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.user_skills))
    )
    if user is None:
        raise ValueError("User not found")
    role = db.scalar(
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.role_skills).selectinload(RoleSkill.skill))
    )
    if role is None:
        raise ValueError("Role not found")

    completed_skills = _qualified_user_skills(user.user_skills)
    matched_importance = 0.0
    for requirement in role.role_skills:
        user_skill = completed_skills.get(requirement.skill_id)
        if user_skill is None:
            continue
        user_level = LEVEL_RANK[normalize_skill_level(user_skill.level)]
        required_level = _required_level_rank(requirement.skill.difficulty)
        matched_importance += requirement.importance * min(
            user_level / required_level, 1.0
        )
    satisfied_skill_ids = _satisfied_skill_ids(role, user.user_skills)
    total_importance = sum(item.importance for item in role.role_skills)
    overall_score = round(
        matched_importance / total_importance * 100 if total_importance else 100.0,
        2,
    )
    return {
        "user_id": user_id,
        "role_id": role_id,
        "role": role.title,
        "overall_score": overall_score,
        "missing_skills": _missing_skills(role, satisfied_skill_ids),
    }


def save_skill_gap_analysis(
    db: Session, analysis: SkillGapAnalysis
) -> SkillGapResult:
    db.execute(
        update(SkillGap)
        .where(
            SkillGap.user_id == analysis["user_id"],
            SkillGap.is_active.is_(True),
        )
        .values(is_active=False)
    )
    gap = SkillGap(
        user_id=analysis["user_id"],
        role_id=analysis["role_id"],
        overall_score=analysis["overall_score"],
        is_active=True,
    )
    try:
        db.add(gap)
        db.commit()
        db.refresh(gap)
    except Exception:
        db.rollback()
        raise
    return {
        "id": gap.id,
        "user_id": gap.user_id,
        "role_id": gap.role_id,
        "role": analysis["role"],
        "overall_score": gap.overall_score,
        "missing_skills": analysis["missing_skills"],
        "generated_at": gap.generated_at.isoformat(),
    }


def calculate_skill_gap(
    user_id: int, role_id: int, db: Session | None = None
) -> SkillGapResult:
    owns_session = db is None
    session = db or SessionLocal()
    try:
        analysis = calculate_skill_gap_analysis(user_id, role_id, session)
        return save_skill_gap_analysis(session, analysis)
    finally:
        if owns_session:
            session.close()


def get_latest_skill_gap(user_id: int, db: Session) -> SkillGapResult | None:
    gap = db.scalar(
        select(SkillGap)
        .where(SkillGap.user_id == user_id, SkillGap.is_active.is_(True))
        .order_by(SkillGap.generated_at.desc(), SkillGap.id.desc())
        .limit(1)
    )
    if gap is None:
        return None
    role = db.scalar(
        select(Role)
        .where(Role.id == gap.role_id)
        .options(selectinload(Role.role_skills).selectinload(RoleSkill.skill))
    )
    user = db.scalar(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.user_skills))
    )
    if role is None or user is None:
        return None
    satisfied_skill_ids = _satisfied_skill_ids(role, user.user_skills)
    return {
        "id": gap.id,
        "user_id": gap.user_id,
        "role_id": gap.role_id,
        "role": role.title,
        "overall_score": gap.overall_score,
        "missing_skills": _missing_skills(role, satisfied_skill_ids),
        "generated_at": gap.generated_at.isoformat(),
    }
