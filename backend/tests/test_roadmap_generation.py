from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.user import User
from app.services.roadmap_generator import generate_roadmap


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_scenario(client: TestClient) -> tuple[Session, User, Role]:
    db = database_session(client)
    role = Role(title="Backend Developer")
    role.role_skills.extend(
        [
            RoleSkill(
                skill=Skill(
                    name="Docker", category="DevOps", difficulty="Intermediate"
                ),
                importance=70,
            ),
            RoleSkill(
                skill=Skill(
                    name="FastAPI", category="Backend Framework", difficulty="Advanced"
                ),
                importance=90,
            ),
        ]
    )
    user = User(name="Lin", email="lin-roadmap@example.com", password_hash="hash")
    db.add_all([role, user])
    db.commit()
    return db, user, role


def test_generate_roadmap_creates_ordered_steps_and_goal(client: TestClient) -> None:
    db, user, role = build_scenario(client)

    roadmap = generate_roadmap(user.id, role.id, db)

    assert roadmap.career_goal.target_role_id == role.id
    assert roadmap.career_goal.role is role
    assert [step.skill.name for step in roadmap.steps] == ["FastAPI", "Docker"]
    assert [step.order for step in roadmap.steps] == [1, 2]
    assert [step.week_number for step in roadmap.steps] == [1, 2]
    assert [step.estimated_hours for step in roadmap.steps] == [15, 10]
    db.close()


def test_generate_and_fetch_current_roadmap_api(client: TestClient) -> None:
    db, user, role = build_scenario(client)
    user_id, role_id = user.id, role.id
    db.close()
    headers = {"Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"}

    generated = client.post(
        "/api/v1/roadmap/generate", json={"role_id": role_id}, headers=headers
    )
    assert generated.status_code == 201
    assert generated.json()["role"] == "Backend Developer"
    assert [step["skill"] for step in generated.json()["steps"]] == [
        "FastAPI",
        "Docker",
    ]

    current = client.get("/api/v1/roadmap/current", headers=headers)
    assert current.status_code == 200
    assert current.json() == generated.json()


def test_current_roadmap_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/roadmap/current").status_code == 401
