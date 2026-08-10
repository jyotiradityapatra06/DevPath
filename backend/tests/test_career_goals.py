from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.role import Role
from app.models.user import User


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_users_and_roles(
    client: TestClient,
) -> tuple[dict[str, str], dict[str, str], int, int]:
    db = database_session(client)
    owner = User(name="Ada", email="ada-goals@example.com", password_hash="hash")
    other = User(name="Lin", email="lin-goals@example.com", password_hash="hash")
    backend = Role(title="Backend Engineer")
    ai = Role(title="AI Engineer")
    db.add_all([owner, other, backend, ai])
    db.commit()
    result = (
        {"Authorization": f"Bearer {create_access_token({'sub': str(owner.id)})}"},
        {"Authorization": f"Bearer {create_access_token({'sub': str(other.id)})}"},
        backend.id,
        ai.id,
    )
    db.close()
    return result


def goal_payload(role_id: int) -> dict[str, object]:
    return {
        "target_role_id": role_id,
        "experience_level": "Beginner",
        "timeline": "6 months",
        "preferences": "Project-based learning",
    }


def test_user_creates_career_goal(client: TestClient) -> None:
    owner_headers, _, role_id, _ = build_users_and_roles(client)

    response = client.post(
        "/api/v1/career-goals", json=goal_payload(role_id), headers=owner_headers
    )

    assert response.status_code == 201
    assert response.json()["target_role"] == "Backend Engineer"
    assert response.json()["timeline"] == "6 months"


def test_user_retrieves_own_goal(client: TestClient) -> None:
    owner_headers, _, role_id, _ = build_users_and_roles(client)
    created = client.post(
        "/api/v1/career-goals", json=goal_payload(role_id), headers=owner_headers
    ).json()

    response = client.get("/api/v1/career-goals/me", headers=owner_headers)

    assert response.status_code == 200
    assert response.json() == created


def test_user_updates_goal(client: TestClient) -> None:
    owner_headers, _, role_id, ai_role_id = build_users_and_roles(client)
    client.post(
        "/api/v1/career-goals", json=goal_payload(role_id), headers=owner_headers
    )

    response = client.put(
        "/api/v1/career-goals/me",
        json={
            "target_role_id": ai_role_id,
            "experience_level": "Intermediate",
            "timeline": "12 months",
            "preferences": "Hands-on learning",
        },
        headers=owner_headers,
    )

    assert response.status_code == 200
    assert response.json()["target_role"] == "AI Engineer"
    assert response.json()["experience_level"] == "Intermediate"
    assert response.json()["timeline"] == "12 months"
    assert response.json()["preferences"] == "Hands-on learning"


def test_user_deletes_goal(client: TestClient) -> None:
    owner_headers, _, role_id, _ = build_users_and_roles(client)
    client.post(
        "/api/v1/career-goals", json=goal_payload(role_id), headers=owner_headers
    )

    response = client.delete("/api/v1/career-goals/me", headers=owner_headers)

    assert response.status_code == 204
    assert client.get("/api/v1/career-goals/me", headers=owner_headers).status_code == 404


def test_invalid_role_is_rejected(client: TestClient) -> None:
    owner_headers, _, _, _ = build_users_and_roles(client)

    response = client.post(
        "/api/v1/career-goals", json=goal_payload(999), headers=owner_headers
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Role not found"


def test_user_cannot_access_another_users_goal(client: TestClient) -> None:
    owner_headers, other_headers, role_id, _ = build_users_and_roles(client)
    client.post(
        "/api/v1/career-goals", json=goal_payload(role_id), headers=owner_headers
    )

    assert client.get("/api/v1/career-goals/me", headers=other_headers).status_code == 404
    assert client.put(
        "/api/v1/career-goals/me",
        json={"experience_level": "Advanced"},
        headers=other_headers,
    ).status_code == 404
    assert client.delete(
        "/api/v1/career-goals/me", headers=other_headers
    ).status_code == 404
    assert client.get("/api/v1/career-goals/me", headers=owner_headers).status_code == 200


def test_career_goal_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/career-goals", json=goal_payload(1)).status_code == 401
    assert client.get("/api/v1/career-goals/me").status_code == 401
    assert client.put(
        "/api/v1/career-goals/me", json={"experience_level": "Advanced"}
    ).status_code == 401
    assert client.delete("/api/v1/career-goals/me").status_code == 401
