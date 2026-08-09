from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.connection import SessionLocal
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill_gap import SkillGap
from app.models.user import User


DIFFICULTY_WEIGHTS = {"beginner": 50, "intermediate": 75, "advanced": 100}


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


def _build_result(gap: SkillGap, role: Role, user_skill_ids: set[int]) -> SkillGapResult:
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
    return {
        "id": gap.id,
        "user_id": gap.user_id,
        "role_id": gap.role_id,
        "role": role.title,
        "overall_score": gap.overall_score,
        "missing_skills": missing,
        "generated_at": gap.generated_at.isoformat(),
    }


def calculate_skill_gap(
    user_id: int, role_id: int, db: Session | None = None
) -> SkillGapResult:
    owns_session = db is None
    session = db or SessionLocal()
    try:
        user = session.scalar(
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.user_skills))
        )
        if user is None:
            raise ValueError("User not found")
        role = session.scalar(
            select(Role)
            .where(Role.id == role_id)
            .options(selectinload(Role.role_skills).selectinload(RoleSkill.skill))
        )
        if role is None:
            raise ValueError("Role not found")

        user_skill_ids = {item.skill_id for item in user.user_skills}
        total_importance = sum(item.importance for item in role.role_skills)
        matched_importance = sum(
            item.importance for item in role.role_skills if item.skill_id in user_skill_ids
        )
        overall_score = round(
            matched_importance / total_importance * 100 if total_importance else 100.0,
            2,
        )
        gap = SkillGap(user_id=user_id, role_id=role_id, overall_score=overall_score)
        session.add(gap)
        session.commit()
        session.refresh(gap)
        return _build_result(gap, role, user_skill_ids)
    except Exception:
        session.rollback()
        raise
    finally:
        if owns_session:
            session.close()


def get_latest_skill_gap(user_id: int, db: Session) -> SkillGapResult | None:
    gap = db.scalar(
        select(SkillGap)
        .where(SkillGap.user_id == user_id)
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
    return _build_result(gap, role, {item.skill_id for item in user.user_skills})
