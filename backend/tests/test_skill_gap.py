import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.skill_gap import SkillGap
from app.models.user import User
from app.models.user_skill import UserSkill
from app.services.skill_gap import calculate_skill_gap


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_gap_scenario(client: TestClient) -> tuple[Session, User, Role]:
    db = database_session(client)
    python = Skill(
        name="Python", category="Programming Language", difficulty="Intermediate"
    )
    fastapi = Skill(
        name="FastAPI", category="Backend Framework", difficulty="Advanced"
    )
    role = Role(title="Backend Developer")
    role.role_skills.extend(
        [
            RoleSkill(skill=python, importance=95),
            RoleSkill(skill=fastapi, importance=90),
        ]
    )
    user = User(name="Ada", email="ada-gap@example.com", password_hash="hash")
    user.user_skills.append(
        UserSkill(skill=python, level="Intermediate", status="active")
    )
    db.add_all([user, role])
    db.commit()
    return db, user, role


def test_skill_comparison_missing_skills_and_score(client: TestClient) -> None:
    db, user, role = build_gap_scenario(client)

    result = calculate_skill_gap(user.id, role.id, db)

    assert result["overall_score"] == pytest.approx(51.35)
    assert len(result["missing_skills"]) == 1
    assert result["missing_skills"][0] == {
        "id": result["missing_skills"][0]["id"],
        "name": "FastAPI",
        "importance": 90,
        "difficulty": "Advanced",
        "priority_score": 93.0,
        "priority": "High",
    }
    saved = db.get(SkillGap, result["id"])
    assert saved is not None
    assert saved.user is user
    assert saved.role is role
    db.close()


def test_analyze_and_latest_api(client: TestClient) -> None:
    db, user, role = build_gap_scenario(client)
    user_id, role_id = user.id, role.id
    db.close()
    headers = {"Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"}

    analyzed = client.post(
        "/api/v1/skill-gap/analyze", json={"role_id": role_id}, headers=headers
    )
    assert analyzed.status_code == 201
    assert analyzed.json()["overall_score"] == pytest.approx(51.35)
    assert analyzed.json()["missing_skills"][0]["name"] == "FastAPI"

    latest = client.get("/api/v1/skill-gap/latest", headers=headers)
    assert latest.status_code == 200
    assert latest.json()["id"] == analyzed.json()["id"]


def test_skill_gap_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/skill-gap/analyze", json={"role_id": 1}).status_code == 401
    assert client.get("/api/v1/skill-gap/latest").status_code == 401


def test_analyze_unknown_role_returns_404(client: TestClient) -> None:
    db = database_session(client)
    user = User(name="Grace", email="grace-gap@example.com", password_hash="hash")
    db.add(user)
    db.commit()
    headers = {"Authorization": f"Bearer {create_access_token({'sub': str(user.id)})}"}
    db.close()

    response = client.post(
        "/api/v1/skill-gap/analyze", json={"role_id": 999}, headers=headers
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Role not found"
