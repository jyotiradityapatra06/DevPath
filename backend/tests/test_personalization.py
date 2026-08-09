import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.personalization import PersonalizedRecommendation
from app.models.profile import Profile
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill
from app.services.personalization import calculate_priority_score


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_scenario(client: TestClient) -> tuple[dict[str, str], int]:
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
    user = User(name="Ada", email="ada-personalization@example.com", password_hash="hash")
    user.profile = Profile(
        full_name="Ada",
        experience_level="Beginner",
        learning_style="Project Based",
        weekly_learning_hours=12,
        target_timeline="6 months",
    )
    user.user_skills.append(
        UserSkill(skill=python, level="Intermediate", status="active")
    )
    goal = CareerGoal(
        name="Ada Backend Goal",
        user=user,
        role=role,
        experience_level="Beginner",
        target_duration="6 months",
    )
    db.add(goal)
    db.commit()
    user_id = user.id
    db.close()
    token = create_access_token({"sub": str(user_id)})
    return {"Authorization": f"Bearer {token}"}, user_id


def test_authenticated_user_can_generate_recommendations(client: TestClient) -> None:
    headers, _ = build_scenario(client)

    response = client.post("/api/v1/personalization/analyze", headers=headers)

    assert response.status_code == 201
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "Learn FastAPI fundamentals"
    assert "currently missing" in response.json()[0]["reason"]


def test_recommendations_are_stored(client: TestClient) -> None:
    headers, user_id = build_scenario(client)
    client.post("/api/v1/personalization/analyze", headers=headers)

    db = database_session(client)
    count = db.scalar(
        select(func.count())
        .select_from(PersonalizedRecommendation)
        .where(PersonalizedRecommendation.user_id == user_id)
    )
    assert count == 1
    assert db.scalar(select(PersonalizedRecommendation)).user_id == user_id
    db.close()


def test_get_recommendations_and_single_recommendation(client: TestClient) -> None:
    headers, _ = build_scenario(client)
    generated = client.post("/api/v1/personalization/analyze", headers=headers).json()

    collection = client.get(
        "/api/v1/personalization/recommendations", headers=headers
    )
    assert collection.status_code == 200
    assert collection.json() == generated

    detail = client.get(
        f"/api/v1/personalization/recommendations/{generated[0]['id']}",
        headers=headers,
    )
    assert detail.status_code == 200
    assert detail.json() == generated[0]


def test_priority_calculation_uses_profile_urgency(client: TestClient) -> None:
    _, user_id = build_scenario(client)
    db = database_session(client)
    profile = db.scalar(select(Profile).where(Profile.user_id == user_id))
    score = calculate_priority_score(
        {
            "id": 1,
            "name": "System Design",
            "importance": 90,
            "difficulty": "Advanced",
            "priority_score": 0,
            "priority": "Low",
        },
        profile,
    )
    assert score == pytest.approx(100.0)
    db.close()


def test_personalization_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/personalization/analyze").status_code == 401
    assert client.get("/api/v1/personalization/recommendations").status_code == 401
    assert client.get("/api/v1/personalization/recommendations/1").status_code == 401
