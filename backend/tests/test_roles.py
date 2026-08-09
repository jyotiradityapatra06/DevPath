from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.user import User


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def test_create_role_and_relationships(client: TestClient) -> None:
    db = database_session(client)
    role = Role(title="Backend Developer", description="Builds APIs")
    skill = Skill(name="Python", category="Programming Language", difficulty="Intermediate")
    role.role_skills.append(RoleSkill(skill=skill, importance=95))
    user = User(name="Ada", email="ada-roles@example.com", password_hash="hash")
    goal = CareerGoal(name="Become a backend developer", role=role, user=user)
    db.add(goal)
    db.commit()
    db.expire_all()

    saved = db.scalar(select(Role).where(Role.title == "Backend Developer"))
    assert saved is not None
    assert saved.role_skills[0].skill.name == "Python"
    assert saved.role_skills[0].skill.user_skills == []
    assert saved.career_goals[0].role is saved
    assert saved.career_goals[0].user.career_goals[0] is saved.career_goals[0]
    db.close()


def test_fetch_roles_and_role_details(client: TestClient) -> None:
    db = database_session(client)
    db.add(Role(title="AI Engineer", description="Builds AI systems"))
    db.commit()
    db.close()

    response = client.get("/api/v1/roles")
    assert response.status_code == 200
    assert response.json()[0]["title"] == "AI Engineer"

    detail = client.get(f"/api/v1/roles/{response.json()[0]['id']}")
    assert detail.status_code == 200
    assert detail.json()["description"] == "Builds AI systems"


def test_fetch_role_skills(client: TestClient) -> None:
    db = database_session(client)
    role = Role(title="Backend Developer")
    role.role_skills.append(
        RoleSkill(
            skill=Skill(name="FastAPI", category="Backend Framework", difficulty="Advanced"),
            importance=90,
        )
    )
    db.add(role)
    db.commit()
    role_id = role.id
    db.close()

    response = client.get(f"/api/v1/roles/{role_id}/skills")
    assert response.status_code == 200
    assert response.json() == {
        "role": "Backend Developer",
        "skills": [{"name": "FastAPI", "importance": 90, "difficulty": "Advanced"}],
    }


def test_missing_role_returns_404(client: TestClient) -> None:
    assert client.get("/api/v1/roles/999").status_code == 404
    assert client.get("/api/v1/roles/999/skills").status_code == 404
