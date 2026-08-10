from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.personalization import PersonalizedRecommendation
from app.models.roadmap import Roadmap
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.skill_gap import SkillGap
from app.models.user import User
from app.models.user_skill import UserSkill


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_active_intelligence(
    client: TestClient,
) -> tuple[dict[str, str], int, int, int]:
    db = database_session(client)
    old_role = Role(title="Backend Engineer")
    old_role.role_skills.append(
        RoleSkill(
            skill=Skill(name="Docker", category="DevOps", difficulty="Intermediate"),
            importance=80,
        )
    )
    new_role = Role(title="AI Engineer")
    new_role.role_skills.append(
        RoleSkill(
            skill=Skill(
                name="Machine Learning",
                category="Artificial Intelligence",
                difficulty="Advanced",
            ),
            importance=95,
        )
    )
    user = User(name="Ada", email="ada-state@example.com", password_hash="hash")
    goal = CareerGoal(name="Ada active goal", user=user, role=old_role)
    db.add_all([goal, new_role])
    db.commit()
    user_id, old_role_id, new_role_id = user.id, old_role.id, new_role.id
    db.close()
    headers = {"Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"}
    roadmap_id = client.post(
        "/api/v1/roadmap/generate",
        json={"role_id": old_role_id},
        headers=headers,
    ).json()["id"]
    assert client.post(
        "/api/v1/personalization/analyze", headers=headers
    ).status_code == 201
    return headers, user_id, new_role_id, roadmap_id


def change_target_role(
    client: TestClient, headers: dict[str, str], new_role_id: int
) -> None:
    response = client.put(
        "/api/v1/career-goals/me",
        json={"target_role_id": new_role_id},
        headers=headers,
    )
    assert response.status_code == 200


def test_user_changes_career_goal(client: TestClient) -> None:
    headers, _, new_role_id, _ = build_active_intelligence(client)

    change_target_role(client, headers, new_role_id)

    assert client.get("/api/v1/career-goals/me", headers=headers).json()[
        "target_role"
    ] == "AI Engineer"


def test_old_roadmap_becomes_inactive(client: TestClient) -> None:
    headers, _, new_role_id, roadmap_id = build_active_intelligence(client)

    change_target_role(client, headers, new_role_id)

    db = database_session(client)
    assert db.get(Roadmap, roadmap_id).is_active is False
    db.close()


def test_old_recommendations_and_skill_gaps_become_inactive(
    client: TestClient,
) -> None:
    headers, user_id, new_role_id, _ = build_active_intelligence(client)

    change_target_role(client, headers, new_role_id)

    db = database_session(client)
    recommendations = db.scalars(
        select(PersonalizedRecommendation).where(
            PersonalizedRecommendation.user_id == user_id
        )
    ).all()
    gaps = db.scalars(select(SkillGap).where(SkillGap.user_id == user_id)).all()
    assert recommendations and all(not item.is_active for item in recommendations)
    assert gaps and all(not item.is_active for item in gaps)
    db.close()


def test_dashboard_does_not_return_stale_intelligence(client: TestClient) -> None:
    headers, _, new_role_id, _ = build_active_intelligence(client)
    change_target_role(client, headers, new_role_id)

    response = client.get("/api/v1/dashboard", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["career_profile"]["target_role"] == "AI Engineer"
    assert data["roadmap_progress"]["total_steps"] == 0
    assert data["ai_recommendations"] == []


def test_new_generation_restores_current_intelligence(client: TestClient) -> None:
    headers, user_id, new_role_id, old_roadmap_id = build_active_intelligence(client)
    change_target_role(client, headers, new_role_id)

    new_roadmap = client.post(
        "/api/v1/roadmap/generate",
        json={"role_id": new_role_id},
        headers=headers,
    )
    recommendations = client.post(
        "/api/v1/personalization/analyze", headers=headers
    )
    dashboard = client.get("/api/v1/dashboard", headers=headers).json()

    assert new_roadmap.status_code == 201
    assert recommendations.status_code == 201
    assert dashboard["roadmap_progress"]["total_steps"] == 1
    assert dashboard["ai_recommendations"] == [
        "Learn Machine Learning fundamentals"
    ]
    db = database_session(client)
    assert db.get(Roadmap, old_roadmap_id).is_active is False
    assert db.get(Roadmap, new_roadmap.json()["id"]).is_active is True
    assert db.scalars(
        select(SkillGap).where(
            SkillGap.user_id == user_id, SkillGap.is_active.is_(True)
        )
    ).all()
    db.close()


def test_skill_change_invalidates_current_intelligence(client: TestClient) -> None:
    headers, user_id, _, roadmap_id = build_active_intelligence(client)
    db = database_session(client)
    docker = db.scalar(select(Skill).where(Skill.name == "Docker"))
    db.add(
        UserSkill(
            user_id=user_id,
            skill_id=docker.id,
            level="INTERMEDIATE",
            status="COMPLETED",
        )
    )
    db.commit()
    skill_id = docker.id
    db.close()

    response = client.put(
        f"/api/v1/user-skills/{skill_id}",
        json={"level": "ADVANCED"},
        headers=headers,
    )

    assert response.status_code == 200
    db = database_session(client)
    assert db.get(Roadmap, roadmap_id).is_active is False
    assert not db.scalars(
        select(PersonalizedRecommendation).where(
            PersonalizedRecommendation.user_id == user_id,
            PersonalizedRecommendation.is_active.is_(True),
        )
    ).all()
    assert not db.scalars(
        select(SkillGap).where(
            SkillGap.user_id == user_id, SkillGap.is_active.is_(True)
        )
    ).all()
    db.close()
