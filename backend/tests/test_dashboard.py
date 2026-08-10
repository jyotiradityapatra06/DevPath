from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.personalization import PersonalizedRecommendation
from app.models.profile import Profile
from app.models.progress import Progress
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.skill_gap import SkillGap
from app.models.user import User
from app.models.user_skill import UserSkill


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_dashboard(client: TestClient) -> dict[str, str]:
    db = database_session(client)
    python = Skill(name="Python", category="Language", difficulty="Advanced")
    docker = Skill(name="Docker", category="DevOps", difficulty="Intermediate")
    design = Skill(name="System Design", category="Architecture", difficulty="Advanced")
    role = Role(title="Backend Engineer")
    role.role_skills.extend(
        [
            RoleSkill(skill=python, importance=100),
            RoleSkill(skill=docker, importance=80),
            RoleSkill(skill=design, importance=60),
        ]
    )
    user = User(name="Grace", email="grace-dashboard@example.com", password_hash="hash")
    user.profile = Profile(full_name="Grace", experience_level="Beginner")
    user.user_skills.extend(
        [
            UserSkill(skill=python, level="ADVANCED", status="COMPLETED"),
            UserSkill(skill=docker, level="INTERMEDIATE", status="IN_PROGRESS"),
        ]
    )
    goal = CareerGoal(
        name="Grace Backend Goal",
        user=user,
        role=role,
        experience_level="Beginner",
    )
    roadmap = Roadmap(career_goal=goal, title="Backend roadmap", duration="3 weeks")
    roadmap.steps.extend(
        [
            RoadmapStep(title="Python", order=1, week_number=1, skill=python),
            RoadmapStep(title="Docker", order=2, week_number=2, skill=docker),
            RoadmapStep(title="Design", order=3, week_number=3, skill=design),
        ]
    )
    db.add(roadmap)
    db.flush()
    db.add_all(
        [
            Progress(user=user, step=roadmap.steps[0], status="completed"),
            Progress(user=user, step=roadmap.steps[1], status="in_progress"),
            PersonalizedRecommendation(
                user=user,
                recommendation_type="SKILL_GAP",
                title="Complete Docker fundamentals",
                description="Learn Docker",
                reason="Required for the role",
                priority_score=80,
                priority_level="HIGH",
            ),
        ]
    )
    db.commit()
    user_id = user.id
    db.close()
    return {"Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"}


def test_authenticated_user_gets_dashboard_successfully(client: TestClient) -> None:
    response = client.get("/api/v1/dashboard", headers=build_dashboard(client))

    assert response.status_code == 200
    assert response.json()["ai_recommendations"] == ["Complete Docker fundamentals"]


def test_dashboard_does_not_persist_skill_gap(client: TestClient) -> None:
    headers = build_dashboard(client)
    db = database_session(client)
    before = db.scalar(select(func.count()).select_from(SkillGap))
    db.close()

    response = client.get("/api/v1/dashboard", headers=headers)

    db = database_session(client)
    after = db.scalar(select(func.count()).select_from(SkillGap))
    db.close()
    assert response.status_code == 200
    assert before == 0
    assert after == before


def test_dashboard_returns_correct_role_information(client: TestClient) -> None:
    data = client.get("/api/v1/dashboard", headers=build_dashboard(client)).json()

    assert data["career_profile"]["target_role"] == "Backend Engineer"
    assert data["career_profile"]["experience_level"] == "Beginner"
    assert data["career_profile"]["readiness_score"] == 41.67


def test_skill_counts_are_calculated_correctly(client: TestClient) -> None:
    data = client.get("/api/v1/dashboard", headers=build_dashboard(client)).json()

    assert data["skill_overview"] == {
        "total_skills": 3,
        "completed": 1,
        "in_progress": 1,
        "missing": 1,
    }
    assert data["strengths"] == [{"skill": "Python", "level": "ADVANCED"}]


def test_missing_skills_are_returned(client: TestClient) -> None:
    data = client.get("/api/v1/dashboard", headers=build_dashboard(client)).json()

    assert data["skill_gaps"] == [
        {"skill": "Docker", "priority": "Medium"},
        {"skill": "System Design", "priority": "Medium"},
    ]


def test_roadmap_progress_calculation_works(client: TestClient) -> None:
    data = client.get("/api/v1/dashboard", headers=build_dashboard(client)).json()

    assert data["roadmap_progress"] == {
        "current_phase": 2,
        "completion_percentage": 33.33,
        "completed_steps": 1,
        "total_steps": 3,
    }


def test_dashboard_requires_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/dashboard").status_code == 401
