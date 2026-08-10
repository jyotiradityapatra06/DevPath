from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.profile import Profile
from app.models.progress import Progress
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill
from app.services.ai_context import build_ai_context


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_context_scenario(
    client: TestClient,
    *,
    include_profile: bool = True,
    include_goal: bool = True,
    include_roadmap: bool = True,
) -> tuple[Session, int]:
    db = database_session(client)
    python = Skill(name="Python", category="Language", difficulty="Intermediate")
    docker = Skill(name="Docker", category="DevOps", difficulty="Intermediate")
    role = Role(title="Backend Engineer")
    role.role_skills.extend(
        [
            RoleSkill(skill=python, importance=95),
            RoleSkill(skill=docker, importance=80),
        ]
    )
    user = User(name="Ada", email="ada-ai-context@example.com", password_hash="hash")
    user.user_skills.append(
        UserSkill(skill=python, level="INTERMEDIATE", status="COMPLETED")
    )
    if include_profile:
        user.profile = Profile(
            full_name="Ada",
            experience_level="Beginner",
            learning_style="Project Based",
            weekly_learning_hours=10,
            target_timeline="6 months",
        )
    if include_goal:
        goal = CareerGoal(name="Ada AI context goal", user=user, role=role)
        if include_roadmap:
            roadmap = Roadmap(career_goal=goal, title="Backend roadmap", duration="2 weeks")
            roadmap.steps.extend(
                [
                    RoadmapStep(title="Python foundations", order=1, skill=python),
                    RoadmapStep(title="Docker foundations", order=2, skill=docker),
                ]
            )
            db.add(roadmap)
            db.flush()
            db.add(
                Progress(user=user, step=roadmap.steps[0], status="completed")
            )
        else:
            db.add(goal)
    else:
        db.add_all([user, role])
    db.commit()
    return db, user.id


def test_complete_user_context(client: TestClient) -> None:
    db, user_id = build_context_scenario(client)

    context = build_ai_context(db, user_id)

    assert context["user"] == {"id": user_id, "name": "Ada"}
    assert context["profile"]["learning_style"] == "Project Based"
    assert context["career_goal"]["target_role"] == "Backend Engineer"
    assert context["skills"] == [
        {
            "skill_id": context["skills"][0]["skill_id"],
            "skill": "Python",
            "level": "INTERMEDIATE",
            "status": "COMPLETED",
        }
    ]
    assert [item["name"] for item in context["skill_gap"]["missing_skills"]] == [
        "Docker"
    ]
    assert context["roadmap"]["title"] == "Backend roadmap"
    db.close()


def test_context_handles_missing_profile(client: TestClient) -> None:
    db, user_id = build_context_scenario(client, include_profile=False)

    context = build_ai_context(db, user_id)

    assert context["profile"] is None
    assert context["career_goal"] is not None
    db.close()


def test_context_handles_missing_career_goal(client: TestClient) -> None:
    db, user_id = build_context_scenario(client, include_goal=False, include_roadmap=False)

    context = build_ai_context(db, user_id)

    assert context["career_goal"] is None
    assert context["skill_gap"] is None
    assert context["roadmap"] is None
    db.close()


def test_context_handles_missing_roadmap(client: TestClient) -> None:
    db, user_id = build_context_scenario(client, include_roadmap=False)

    context = build_ai_context(db, user_id)

    assert context["career_goal"] is not None
    assert context["roadmap"] is None
    assert context["progress"] == {
        "completed_steps": 0,
        "total_steps": 0,
        "completion_percentage": 0.0,
    }
    db.close()


def test_context_calculates_progress(client: TestClient) -> None:
    db, user_id = build_context_scenario(client)

    context = build_ai_context(db, user_id)

    assert context["progress"] == {
        "completed_steps": 1,
        "total_steps": 2,
        "completion_percentage": 50.0,
    }
    assert [step["status"] for step in context["roadmap"]["steps"]] == [
        "completed",
        "not_started",
    ]
    db.close()
