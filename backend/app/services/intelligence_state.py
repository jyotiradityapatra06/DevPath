from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.models.personalization import PersonalizedRecommendation
from app.models.roadmap import Roadmap
from app.models.skill_gap import SkillGap


def invalidate_user_intelligence(
    db: Session, user_id: int, career_goal_id: int | None = None
) -> None:
    goal_ids = (
        select(CareerGoal.id).where(CareerGoal.user_id == user_id)
        if career_goal_id is None
        else [career_goal_id]
    )
    db.execute(
        update(Roadmap)
        .where(
            Roadmap.career_goal_id.in_(goal_ids),
            Roadmap.is_active.is_(True),
        )
        .values(is_active=False)
    )
    db.execute(
        update(PersonalizedRecommendation)
        .where(
            PersonalizedRecommendation.user_id == user_id,
            PersonalizedRecommendation.is_active.is_(True),
        )
        .values(is_active=False)
    )
    db.execute(
        update(SkillGap)
        .where(SkillGap.user_id == user_id, SkillGap.is_active.is_(True))
        .values(is_active=False)
    )
from app.models.career_goal import CareerGoal
