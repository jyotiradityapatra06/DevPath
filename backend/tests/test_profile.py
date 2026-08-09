from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.user import User


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def authenticated_user(client: TestClient) -> tuple[dict[str, str], int]:
    db = database_session(client)
    user = User(name="Ada", email="ada-profile@example.com", password_hash="hash")
    db.add(user)
    db.commit()
    user_id = user.id
    db.close()
    token = create_access_token({"sub": str(user_id)})
    return {"Authorization": f"Bearer {token}"}, user_id


def profile_payload() -> dict[str, object]:
    return {
        "education": "University",
        "degree": "BSc Computer Science",
        "graduation_year": 2026,
        "experience_level": "Beginner",
        "preferred_domain": "Backend Development",
        "learning_style": "Project Based",
        "weekly_learning_hours": 12,
        "target_timeline": "6 months",
    }


def test_create_profile(client: TestClient) -> None:
    headers, user_id = authenticated_user(client)
    response = client.post("/api/v1/profile", json=profile_payload(), headers=headers)

    assert response.status_code == 201
    assert response.json()["user_id"] == user_id
    assert response.json()["degree"] == "BSc Computer Science"
    assert response.json()["updated_at"]


def test_retrieve_profile(client: TestClient) -> None:
    headers, _ = authenticated_user(client)
    client.post("/api/v1/profile", json=profile_payload(), headers=headers)

    response = client.get("/api/v1/profile/me", headers=headers)

    assert response.status_code == 200
    assert response.json()["preferred_domain"] == "Backend Development"


def test_update_profile(client: TestClient) -> None:
    headers, _ = authenticated_user(client)
    client.post("/api/v1/profile", json=profile_payload(), headers=headers)

    response = client.put(
        "/api/v1/profile/me",
        json={"experience_level": "Intermediate", "weekly_learning_hours": 20},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json()["experience_level"] == "Intermediate"
    assert response.json()["weekly_learning_hours"] == 20
    assert response.json()["degree"] == "BSc Computer Science"


def test_profile_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/profile", json=profile_payload()).status_code == 401
    assert client.get("/api/v1/profile/me").status_code == 401
    assert client.put("/api/v1/profile/me", json={}).status_code == 401
