from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.user import User


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def authenticated_users(
    client: TestClient,
) -> tuple[dict[str, str], dict[str, str]]:
    db = database_session(client)
    owner = User(name="Ada", email="ada-conversations@example.com", password_hash="hash")
    other = User(name="Lin", email="lin-conversations@example.com", password_hash="hash")
    db.add_all([owner, other])
    db.commit()
    headers = (
        {"Authorization": f"Bearer {create_access_token({'sub': str(owner.id)})}"},
        {"Authorization": f"Bearer {create_access_token({'sub': str(other.id)})}"},
    )
    db.close()
    return headers


def create_conversation(client: TestClient, headers: dict[str, str]) -> dict[str, object]:
    response = client.post(
        "/api/v1/conversations",
        json={"title": "Backend career coaching"},
        headers=headers,
    )
    assert response.status_code == 201
    return response.json()


def test_conversation_creation(client: TestClient) -> None:
    owner_headers, _ = authenticated_users(client)

    conversation = create_conversation(client, owner_headers)

    assert conversation["title"] == "Backend career coaching"
    assert conversation["created_at"]
    assert conversation["updated_at"]


def test_message_creation(client: TestClient) -> None:
    owner_headers, _ = authenticated_users(client)
    conversation = create_conversation(client, owner_headers)

    response = client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        json={"role": "user", "content": "How should I learn Docker?"},
        headers=owner_headers,
    )

    assert response.status_code == 201
    assert response.json()["role"] == "user"
    assert response.json()["content"] == "How should I learn Docker?"


def test_history_retrieval(client: TestClient) -> None:
    owner_headers, _ = authenticated_users(client)
    conversation = create_conversation(client, owner_headers)
    for role, content in [
        ("user", "Help me prepare."),
        ("assistant", "Start with your roadmap."),
    ]:
        client.post(
            f"/api/v1/conversations/{conversation['id']}/messages",
            json={"role": role, "content": content},
            headers=owner_headers,
        )

    collection = client.get("/api/v1/conversations", headers=owner_headers)
    detail = client.get(
        f"/api/v1/conversations/{conversation['id']}", headers=owner_headers
    )

    assert collection.status_code == 200
    assert [item["id"] for item in collection.json()] == [conversation["id"]]
    assert detail.status_code == 200
    assert [item["role"] for item in detail.json()["messages"]] == [
        "user",
        "assistant",
    ]


def test_user_isolation(client: TestClient) -> None:
    owner_headers, other_headers = authenticated_users(client)
    conversation = create_conversation(client, owner_headers)

    assert client.get("/api/v1/conversations", headers=other_headers).json() == []
    assert client.get(
        f"/api/v1/conversations/{conversation['id']}", headers=other_headers
    ).status_code == 404
    assert client.post(
        f"/api/v1/conversations/{conversation['id']}/messages",
        json={"role": "user", "content": "Unauthorized"},
        headers=other_headers,
    ).status_code == 404


def test_conversation_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post(
        "/api/v1/conversations", json={"title": "Private"}
    ).status_code == 401
    assert client.get("/api/v1/conversations").status_code == 401
    assert client.get("/api/v1/conversations/1").status_code == 401
    assert client.post(
        "/api/v1/conversations/1/messages",
        json={"role": "user", "content": "Private"},
    ).status_code == 401
