from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.career_goal import CareerGoal
from app.models.progress import Progress
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.user import User
from app.models.user_skill import UserSkill
from app.schemas.dashboard import (
    CareerProfile,
    DashboardResponse,
    RoadmapProgress,
    SkillGapItem,
    SkillOverview,
    Strength,
)
from app.services.personalization import get_recommendations
from app.services.roadmap_generator import get_current_roadmap
from app.services.skill_gap import calculate_skill_gap


COMPLETED_STATUSES = {"completed", "mastered"}
LEVEL_RANK = {"advanced": 3, "intermediate": 2, "beginner": 1}


def _latest_goal(db: Session, user_id: int) -> CareerGoal | None:
    return db.scalar(
        select(CareerGoal)
        .where(CareerGoal.user_id == user_id, CareerGoal.target_role_id.is_not(None))
        .order_by(CareerGoal.id.desc())
        .options(
            selectinload(CareerGoal.role)
            .selectinload(Role.role_skills)
            .selectinload(RoleSkill.skill)
        )
        .limit(1)
    )


def _roadmap_progress(db: Session, user_id: int) -> RoadmapProgress:
    roadmap = get_current_roadmap(user_id, db)
    if roadmap is None:
        return RoadmapProgress(
            current_phase=None,
            completion_percentage=0.0,
            completed_steps=0,
            total_steps=0,
        )

    ordered_steps = sorted(roadmap.steps, key=lambda item: item.order)
    step_ids = [step.id for step in ordered_steps]
    progress_by_step = {
        item.step_id: item.status
        for item in db.scalars(
            select(Progress).where(
                Progress.user_id == user_id, Progress.step_id.in_(step_ids)
            )
        ).all()
    } if step_ids else {}
    completed = sum(
        progress_by_step.get(step.id) == "completed" for step in ordered_steps
    )
    current = next(
        (step for step in ordered_steps if progress_by_step.get(step.id) != "completed"),
        None,
    )
    total = len(ordered_steps)
    return RoadmapProgress(
        current_phase=current.week_number if current else None,
        completion_percentage=round(completed / total * 100, 2) if total else 0.0,
        completed_steps=completed,
        total_steps=total,
    )


def get_dashboard(db: Session, user: User) -> DashboardResponse:
    goal = _latest_goal(db, user.id)
    if goal is None or goal.role is None or goal.target_role_id is None:
        raise ValueError("No target career role found")

    gap = calculate_skill_gap(user.id, goal.target_role_id, db)
    required_ids = {requirement.skill_id for requirement in goal.role.role_skills}
    user_skills = list(
        db.scalars(
            select(UserSkill)
            .where(UserSkill.user_id == user.id)
            .options(selectinload(UserSkill.skill))
        ).all()
    )
    required_user_skills = [item for item in user_skills if item.skill_id in required_ids]
    completed = sum(
        item.status.lower() in COMPLETED_STATUSES for item in required_user_skills
    )
    in_progress = len(required_user_skills) - completed
    missing = len(required_ids) - completed - in_progress

    strengths = sorted(
        user_skills,
        key=lambda item: (-LEVEL_RANK.get(item.level.lower(), 0), item.skill.name),
    )
    recommendations = get_recommendations(db, user.id)
    experience_level = (
        user.profile.experience_level if user.profile else None
    ) or goal.experience_level or "Not specified"

    return DashboardResponse(
        career_profile=CareerProfile(
            target_role=goal.role.title,
            experience_level=experience_level,
            readiness_score=gap["overall_score"],
        ),
        skill_overview=SkillOverview(
            total_skills=len(required_ids),
            completed=completed,
            in_progress=in_progress,
            missing=max(missing, 0),
        ),
        strengths=[
            Strength(skill=item.skill.name, level=item.level) for item in strengths[:5]
        ],
        skill_gaps=[
            SkillGapItem(skill=item["name"], priority=item["priority"])
            for item in gap["missing_skills"]
        ],
        roadmap_progress=_roadmap_progress(db, user.id),
        ai_recommendations=[item.title for item in recommendations],
    )
