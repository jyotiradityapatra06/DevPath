import re

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.career_goal import CareerGoal
from app.models.personalization import PersonalizedRecommendation
from app.models.profile import Profile
from app.services.skill_gap import MissingSkill, calculate_skill_gap


def _timeline_factor(target_timeline: str | None) -> float:
    if not target_timeline:
        return 1.0
    match = re.search(r"\d+", target_timeline)
    if match is None:
        return 1.0
    value = int(match.group())
    timeline = target_timeline.lower()
    months = value / 4 if "week" in timeline else value * 12 if "year" in timeline else value
    if months <= 3:
        return 1.15
    if months <= 6:
        return 1.05
    if months <= 12:
        return 0.95
    return 0.85


def _capacity_factor(hours: int | None) -> float:
    if hours is None:
        return 1.0
    if hours <= 5:
        return 1.1
    if hours <= 10:
        return 1.05
    if hours <= 20:
        return 1.0
    return 0.95


def _skill_factor(difficulty: str | None, experience_level: str | None) -> float:
    difficulty_factor = {
        "beginner": 0.9,
        "intermediate": 1.0,
        "advanced": 1.1,
    }.get((difficulty or "").lower(), 1.0)
    experience_factor = {
        "beginner": 1.1,
        "intermediate": 1.0,
        "advanced": 0.9,
    }.get((experience_level or "").lower(), 1.0)
    return difficulty_factor * experience_factor


def calculate_priority_score(skill: MissingSkill, profile: Profile | None) -> float:
    skill_gap = 1.0
    urgency_factor = (
        _timeline_factor(profile.target_timeline if profile else None)
        * _capacity_factor(profile.weekly_learning_hours if profile else None)
        * _skill_factor(
            skill["difficulty"], profile.experience_level if profile else None
        )
    )
    return round(min(100.0, skill["importance"] * skill_gap * urgency_factor), 2)


def _priority_level(score: float) -> str:
    if score >= 80:
        return "HIGH"
    if score >= 50:
        return "MEDIUM"
    return "LOW"


def generate_personalized_recommendations(
    db: Session, user_id: int
) -> list[PersonalizedRecommendation]:
    goal = db.scalar(
        select(CareerGoal)
        .where(CareerGoal.user_id == user_id, CareerGoal.target_role_id.is_not(None))
        .order_by(CareerGoal.id.desc())
        .limit(1)
    )
    if goal is None or goal.target_role_id is None or goal.role is None:
        raise ValueError("No target career role found")

    gap = calculate_skill_gap(user_id, goal.target_role_id, db)
    profile = db.scalar(select(Profile).where(Profile.user_id == user_id))
    learning_style = profile.learning_style if profile and profile.learning_style else "hands-on"

    db.execute(
        delete(PersonalizedRecommendation).where(
            PersonalizedRecommendation.user_id == user_id
        )
    )
    recommendations: list[PersonalizedRecommendation] = []
    for skill in gap["missing_skills"]:
        score = calculate_priority_score(skill, profile)
        recommendation = PersonalizedRecommendation(
            user_id=user_id,
            recommendation_type="SKILL_GAP",
            title=f"Learn {skill['name']} fundamentals",
            description=(
                f"Study {skill['name']} using a {learning_style.lower()} learning approach "
                f"to progress toward the {goal.role.title} role."
            ),
            reason=(
                f"{skill['name']} has {skill['importance']}% importance for your target "
                f"{goal.role.title} role and is currently missing from your skills."
            ),
            priority_score=score,
            priority_level=_priority_level(score),
        )
        db.add(recommendation)
        recommendations.append(recommendation)
    db.commit()
    for recommendation in recommendations:
        db.refresh(recommendation)
    recommendations.sort(key=lambda item: (-item.priority_score, item.title))
    return recommendations


def get_recommendations(
    db: Session, user_id: int
) -> list[PersonalizedRecommendation]:
    return list(
        db.scalars(
            select(PersonalizedRecommendation)
            .where(PersonalizedRecommendation.user_id == user_id)
            .order_by(
                PersonalizedRecommendation.priority_score.desc(),
                PersonalizedRecommendation.id,
            )
        ).all()
    )


def get_recommendation(
    db: Session, user_id: int, recommendation_id: int
) -> PersonalizedRecommendation | None:
    return db.scalar(
        select(PersonalizedRecommendation).where(
            PersonalizedRecommendation.id == recommendation_id,
            PersonalizedRecommendation.user_id == user_id,
        )
    )
