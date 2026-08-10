import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.progress import Progress
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def test_user_cannot_have_duplicate_skill(client: TestClient) -> None:
    db = database_session(client)
    user = User(name="Ada", email="ada-integrity@example.com", password_hash="hash")
    skill = Skill(name="Python", category="Language")
    db.add_all([user, skill])
    db.flush()
    db.add_all(
        [
            UserSkill(user_id=user.id, skill_id=skill.id, level="Beginner", status="active"),
            UserSkill(user_id=user.id, skill_id=skill.id, level="Advanced", status="completed"),
        ]
    )

    with pytest.raises(IntegrityError):
        db.commit()

    db.rollback()
    db.close()


def test_roadmap_step_cannot_have_duplicate_progress(client: TestClient) -> None:
    db = database_session(client)
    user = User(name="Lin", email="lin-integrity@example.com", password_hash="hash")
    goal = CareerGoal(name="Integrity goal", user=user)
    roadmap = Roadmap(career_goal=goal, title="Integrity roadmap")
    step = RoadmapStep(roadmap=roadmap, title="First step", order=1)
    db.add_all([user, step])
    db.flush()
    db.add_all(
        [
            Progress(user_id=user.id, step_id=step.id, status="not_started"),
            Progress(user_id=user.id, step_id=step.id, status="in_progress"),
        ]
    )

    with pytest.raises(IntegrityError):
        db.commit()

    db.rollback()
    db.close()
