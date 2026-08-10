from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.progress import Progress
from app.models.user import User
from app.schemas.user_skills import normalize_skill_level, normalize_skill_status
from app.services.career_goals import get_active_career_goal
from app.services.roadmap_generator import get_current_roadmap
from app.services.skill_gap import calculate_skill_gap_analysis
from app.services.user_skills import list_user_skills


def _profile_context(profile: Profile | None) -> dict[str, Any] | None:
    if profile is None:
        return None
    return {
        "full_name": profile.full_name,
        "education": profile.education,
        "degree": profile.degree,
        "graduation_year": profile.graduation_year,
        "experience_level": profile.experience_level,
        "preferred_domain": profile.preferred_domain,
        "learning_style": profile.learning_style,
        "weekly_learning_hours": profile.weekly_learning_hours,
        "target_timeline": profile.target_timeline,
    }


def build_ai_context(db: Session, user_id: int) -> dict[str, Any]:
    """Build a read-only, provider-neutral snapshot of current user intelligence."""
    user = db.get(User, user_id)
    if user is None:
        raise ValueError("User not found")

    profile = db.scalar(select(Profile).where(Profile.user_id == user_id))
    goal = get_active_career_goal(db, user_id)
    user_skills = list_user_skills(db, user_id)
    roadmap = get_current_roadmap(user_id, db)

    goal_context: dict[str, Any] | None = None
    skill_gap: dict[str, Any] | None = None
    if goal is not None and goal.role is not None and goal.target_role_id is not None:
        goal_context = {
            "id": goal.id,
            "target_role_id": goal.target_role_id,
            "target_role": goal.role.title,
            "experience_level": goal.experience_level,
            "timeline": goal.target_duration or goal.duration,
            "preferences": goal.description,
        }
        skill_gap = dict(
            calculate_skill_gap_analysis(user_id, goal.target_role_id, db)
        )

    roadmap_context: dict[str, Any] | None = None
    progress_context: dict[str, Any] = {
        "completed_steps": 0,
        "total_steps": 0,
        "completion_percentage": 0.0,
    }
    if roadmap is not None:
        ordered_steps = sorted(roadmap.steps, key=lambda item: item.order)
        step_ids = [step.id for step in ordered_steps]
        progress_by_step = {
            item.step_id: item
            for item in db.scalars(
                select(Progress).where(
                    Progress.user_id == user_id,
                    Progress.step_id.in_(step_ids),
                )
            ).all()
        } if step_ids else {}
        completed_steps = sum(
            progress_by_step.get(step.id) is not None
            and progress_by_step[step.id].status == "completed"
            for step in ordered_steps
        )
        total_steps = len(ordered_steps)
        progress_context = {
            "completed_steps": completed_steps,
            "total_steps": total_steps,
            "completion_percentage": (
                round(completed_steps / total_steps * 100, 2)
                if total_steps
                else 0.0
            ),
        }
        roadmap_context = {
            "id": roadmap.id,
            "title": roadmap.title,
            "duration": roadmap.duration,
            "steps": [
                {
                    "id": step.id,
                    "title": step.title,
                    "skill": step.skill.name if step.skill else None,
                    "order": step.order,
                    "week_number": step.week_number,
                    "estimated_hours": step.estimated_hours,
                    "status": (
                        progress_by_step[step.id].status
                        if step.id in progress_by_step
                        else "not_started"
                    ),
                }
                for step in ordered_steps
            ],
        }

    return {
        "user": {"id": user.id, "name": user.name},
        "profile": _profile_context(profile),
        "career_goal": goal_context,
        "skills": [
            {
                "skill_id": item.skill_id,
                "skill": item.skill.name,
                "level": normalize_skill_level(item.level).value,
                "status": normalize_skill_status(item.status).value,
            }
            for item in user_skills
        ],
        "skill_gap": skill_gap,
        "roadmap": roadmap_context,
        "progress": progress_context,
    }
