from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.connection import SessionLocal
from app.models.career_goal import CareerGoal
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.models.role import Role
from app.services.skill_gap import calculate_skill_gap


ESTIMATED_HOURS = {"beginner": 6, "intermediate": 10, "advanced": 15}


def generate_roadmap(
    user_id: int, role_id: int, db: Session | None = None
) -> Roadmap:
    owns_session = db is None
    session = db or SessionLocal()
    try:
        role = session.get(Role, role_id)
        if role is None:
            raise ValueError("Role not found")
        gap = calculate_skill_gap(user_id, role_id, session)
        goal = session.scalar(
            select(CareerGoal).where(
                CareerGoal.user_id == user_id,
                CareerGoal.target_role_id == role_id,
            )
        )
        if goal is None:
            goal = CareerGoal(
                name=f"{role.title} goal for user {user_id}",
                user_id=user_id,
                target_role_id=role_id,
                experience_level="Beginner",
                target_duration=f"{max(len(gap['missing_skills']), 1)} weeks",
            )
            session.add(goal)
            session.flush()

        roadmap = Roadmap(
            career_goal=goal,
            title=f"{role.title} Learning Roadmap",
            duration=f"{max(len(gap['missing_skills']), 1)} weeks",
        )
        for position, missing in enumerate(gap["missing_skills"], start=1):
            difficulty = (missing["difficulty"] or "beginner").lower()
            roadmap.steps.append(
                RoadmapStep(
                    skill_id=missing["id"],
                    title=f"Learn {missing['name']}",
                    description=(
                        f"Build competency in {missing['name']} for the {role.title} role."
                    ),
                    order=position,
                    week_number=position,
                    estimated_hours=ESTIMATED_HOURS.get(difficulty, 6),
                )
            )
        session.add(roadmap)
        session.commit()
        return session.scalar(
            select(Roadmap)
            .where(Roadmap.id == roadmap.id)
            .options(selectinload(Roadmap.steps).selectinload(RoadmapStep.skill))
        )
    except Exception:
        session.rollback()
        raise
    finally:
        if owns_session:
            session.close()


def get_current_roadmap(user_id: int, db: Session) -> Roadmap | None:
    return db.scalar(
        select(Roadmap)
        .join(Roadmap.career_goal)
        .where(CareerGoal.user_id == user_id)
        .order_by(Roadmap.id.desc())
        .options(
            selectinload(Roadmap.career_goal).selectinload(CareerGoal.role),
            selectinload(Roadmap.steps).selectinload(RoadmapStep.skill),
        )
        .limit(1)
    )
