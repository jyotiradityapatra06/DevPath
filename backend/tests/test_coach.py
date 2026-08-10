from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.conversation import Conversation
from app.models.user import User


class MockProvider(AIProvider):
    def __init__(self, response: str = "Build a production-ready API.") -> None:
        self.response = response

    def generate(self, prompt: str) -> str:
        return self.response


class FailingProvider(AIProvider):
    def generate(self, prompt: str) -> str:
        raise RuntimeError("provider unavailable")


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_users_and_conversation(
    client: TestClient,
) -> tuple[dict[str, str], dict[str, str], int]:
    db = database_session(client)
    owner = User(name="Ada", email="ada-coach-api@example.com", password_hash="hash")
    other = User(name="Lin", email="lin-coach-api@example.com", password_hash="hash")
    conversation = Conversation(user=owner, title="Career coach")
    db.add_all([conversation, other])
    db.commit()
    result = (
        {"Authorization": f"Bearer {create_access_token({'sub': str(owner.id)})}"},
        {"Authorization": f"Bearer {create_access_token({'sub': str(other.id)})}"},
        conversation.id,
    )
    db.close()
    return result


def override_provider(client: TestClient, provider: AIProvider) -> None:
    client.app.dependency_overrides[get_ai_provider] = lambda: provider


def test_authentication_required(client: TestClient) -> None:
    override_provider(client, MockProvider())

    response = client.post(
        "/api/v1/coach/chat",
        json={"conversation_id": 1, "message": "Help me plan my career."},
    )

    assert response.status_code == 401


def test_conversation_ownership_protection(client: TestClient) -> None:
    _, other_headers, conversation_id = build_users_and_conversation(client)
    override_provider(client, MockProvider())

    response = client.post(
        "/api/v1/coach/chat",
        json={"conversation_id": conversation_id, "message": "Unauthorized"},
        headers=other_headers,
    )

    assert response.status_code == 404


def test_successful_response(client: TestClient) -> None:
    owner_headers, _, conversation_id = build_users_and_conversation(client)
    override_provider(client, MockProvider("Practice FastAPI and PostgreSQL."))

    response = client.post(
        "/api/v1/coach/chat",
        json={"conversation_id": conversation_id, "message": "What should I study?"},
        headers=owner_headers,
    )

    assert response.status_code == 200
    assert response.json() == {
        "conversation_id": conversation_id,
        "response": "Practice FastAPI and PostgreSQL.",
    }


def test_assistant_message_is_persisted(client: TestClient) -> None:
    owner_headers, _, conversation_id = build_users_and_conversation(client)
    override_provider(client, MockProvider("Build a portfolio project."))
    client.post(
        "/api/v1/coach/chat",
        json={"conversation_id": conversation_id, "message": "Give me a project."},
        headers=owner_headers,
    )

    db = database_session(client)
    conversation = db.get(Conversation, conversation_id)
    assert [message.role for message in conversation.messages] == ["user", "assistant"]
    assert conversation.messages[-1].content == "Build a portfolio project."
    db.close()


def test_provider_failure_handling(client: TestClient) -> None:
    owner_headers, _, conversation_id = build_users_and_conversation(client)
    override_provider(client, FailingProvider())

    response = client.post(
        "/api/v1/coach/chat",
        json={"conversation_id": conversation_id, "message": "Help me."},
        headers=owner_headers,
    )

    assert response.status_code == 502
    assert response.json()["detail"] == "AI provider failed to generate a response"
    db = database_session(client)
    conversation = db.get(Conversation, conversation_id)
    assert [message.role for message in conversation.messages] == ["user"]
    db.close()
