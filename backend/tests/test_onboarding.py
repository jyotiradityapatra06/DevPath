from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.profile import Profile
from app.models.role import Role
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def onboarding_user(client: TestClient) -> tuple[dict[str, str], int]:
    db = database_session(client)
    user = User(name="Ada", email="ada-onboarding@example.com", password_hash="hash")
    role = Role(title="AI Engineer")
    skill = Skill(name="Python", category="Programming Language")
    db.add_all([user, role, skill])
    db.commit()
    user_id = user.id
    db.close()
    return {"Authorization": f"Bearer {create_access_token({'sub': str(user_id)})}"}, user_id


def test_complete_onboarding_requires_persisted_data(client: TestClient) -> None:
    headers, _ = onboarding_user(client)

    response = client.post("/auth/onboarding/complete", headers=headers)

    assert response.status_code == 409
    assert response.json()["detail"] == "Onboarding data is incomplete"


def test_complete_onboarding_persists_status(client: TestClient) -> None:
    headers, user_id = onboarding_user(client)
    db = database_session(client)
    role = db.query(Role).filter_by(title="AI Engineer").one()
    skill = db.query(Skill).filter_by(name="Python").one()
    db.add(Profile(user_id=user_id, full_name="Ada", experience_level="Intermediate"))
    db.add(CareerGoal(name="AI goal", user_id=user_id, target_role_id=role.id))
    db.add(UserSkill(user_id=user_id, skill_id=skill.id, level="INTERMEDIATE", status="IN_PROGRESS"))
    db.commit()
    db.close()

    response = client.post("/auth/onboarding/complete", headers=headers)

    assert response.status_code == 200
    assert response.json()["onboarding_completed"] is True
    assert client.get("/auth/me", headers=headers).json()["onboarding_completed"] is True


def test_complete_onboarding_requires_authentication(client: TestClient) -> None:
    assert client.post("/auth/onboarding/complete").status_code == 401


def test_skills_catalogue_is_available(client: TestClient) -> None:
    _, _ = onboarding_user(client)

    response = client.get("/api/v1/skills")

    assert response.status_code == 200
    assert response.json()[0]["name"] == "Python"
