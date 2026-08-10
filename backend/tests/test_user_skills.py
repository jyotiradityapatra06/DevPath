from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.skill import Skill
from app.models.user import User
from app.models.user_skill import UserSkill


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_users_and_skill(
    client: TestClient,
) -> tuple[dict[str, str], dict[str, str], int, int, int]:
    db = database_session(client)
    owner = User(name="Ada", email="ada-user-skills@example.com", password_hash="hash")
    other = User(name="Lin", email="lin-user-skills@example.com", password_hash="hash")
    skill = Skill(name="Python", category="Language", difficulty="Intermediate")
    db.add_all([owner, other, skill])
    db.commit()
    result = (
        {"Authorization": f"Bearer {create_access_token({'sub': str(owner.id)})}"},
        {"Authorization": f"Bearer {create_access_token({'sub': str(other.id)})}"},
        owner.id,
        other.id,
        skill.id,
    )
    db.close()
    return result


def skill_payload(skill_id: int) -> dict[str, object]:
    return {"skill_id": skill_id, "level": "Intermediate", "status": "active"}


def test_user_can_add_skill(client: TestClient) -> None:
    owner_headers, _, owner_id, _, skill_id = build_users_and_skill(client)

    response = client.post(
        "/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers
    )

    assert response.status_code == 201
    assert response.json()["skill"] == "Python"
    db = database_session(client)
    assert db.query(UserSkill).filter_by(user_id=owner_id, skill_id=skill_id).one()
    db.close()


def test_user_can_list_only_own_skills(client: TestClient) -> None:
    owner_headers, other_headers, _, _, skill_id = build_users_and_skill(client)
    client.post("/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers)

    owner_response = client.get("/api/v1/user-skills", headers=owner_headers)
    other_response = client.get("/api/v1/user-skills", headers=other_headers)

    assert owner_response.status_code == 200
    assert [item["skill_id"] for item in owner_response.json()] == [skill_id]
    assert other_response.status_code == 200
    assert other_response.json() == []


def test_user_can_update_skill(client: TestClient) -> None:
    owner_headers, _, _, _, skill_id = build_users_and_skill(client)
    client.post("/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers)

    response = client.put(
        f"/api/v1/user-skills/{skill_id}",
        json={"level": "Advanced", "status": "completed"},
        headers=owner_headers,
    )

    assert response.status_code == 200
    assert response.json()["level"] == "ADVANCED"
    assert response.json()["status"] == "COMPLETED"


def test_user_can_delete_skill(client: TestClient) -> None:
    owner_headers, _, _, _, skill_id = build_users_and_skill(client)
    client.post("/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers)

    response = client.delete(f"/api/v1/user-skills/{skill_id}", headers=owner_headers)

    assert response.status_code == 204
    assert client.get("/api/v1/user-skills", headers=owner_headers).json() == []


def test_duplicate_skill_creation_fails(client: TestClient) -> None:
    owner_headers, _, _, _, skill_id = build_users_and_skill(client)
    client.post("/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers)

    response = client.post(
        "/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Skill already added"


def test_unknown_skill_creation_fails(client: TestClient) -> None:
    owner_headers, _, _, _, _ = build_users_and_skill(client)

    response = client.post(
        "/api/v1/user-skills", json=skill_payload(999), headers=owner_headers
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Skill not found"


def test_user_cannot_access_another_users_skill(client: TestClient) -> None:
    owner_headers, other_headers, _, _, skill_id = build_users_and_skill(client)
    client.post("/api/v1/user-skills", json=skill_payload(skill_id), headers=owner_headers)

    update = client.put(
        f"/api/v1/user-skills/{skill_id}",
        json={"level": "Advanced"},
        headers=other_headers,
    )
    delete = client.delete(
        f"/api/v1/user-skills/{skill_id}", headers=other_headers
    )

    assert update.status_code == 404
    assert delete.status_code == 404
    assert client.get("/api/v1/user-skills", headers=owner_headers).json()[0][
        "level"
    ] == "INTERMEDIATE"


def test_invalid_skill_status_is_rejected(client: TestClient) -> None:
    owner_headers, _, _, _, skill_id = build_users_and_skill(client)

    response = client.post(
        "/api/v1/user-skills",
        json={"skill_id": skill_id, "level": "BEGINNER", "status": "KNOWN"},
        headers=owner_headers,
    )

    assert response.status_code == 422


def test_invalid_skill_level_is_rejected(client: TestClient) -> None:
    owner_headers, _, _, _, skill_id = build_users_and_skill(client)

    response = client.post(
        "/api/v1/user-skills",
        json={"skill_id": skill_id, "level": "GURU", "status": "COMPLETED"},
        headers=owner_headers,
    )

    assert response.status_code == 422


def test_user_skill_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/user-skills", json=skill_payload(1)).status_code == 401
    assert client.get("/api/v1/user-skills").status_code == 401
    assert client.put("/api/v1/user-skills/1", json={"level": "Advanced"}).status_code == 401
    assert client.delete("/api/v1/user-skills/1").status_code == 401
