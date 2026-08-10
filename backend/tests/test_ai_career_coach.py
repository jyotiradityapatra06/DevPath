from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.role import Role
from app.models.user import User
from app.services.ai_career_coach import (
    CareerCoachProviderError,
    generate_career_coach_response,
)


class MockProvider(AIProvider):
    def __init__(self, response: str = "Focus on practical backend projects.") -> None:
        self.response = response
        self.prompt: str | None = None

    def generate(self, prompt: str) -> str:
        self.prompt = prompt
        return self.response


class FailingProvider(AIProvider):
    def generate(self, prompt: str) -> str:
        raise RuntimeError("provider unavailable")


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_scenario(client: TestClient) -> tuple[Session, int, int]:
    db = database_session(client)
    user = User(name="Ada", email="ada-coach@example.com", password_hash="hash")
    role = Role(title="Backend Engineer")
    goal = CareerGoal(name="Ada coach goal", user=user, role=role)
    conversation = Conversation(user=user, title="Career coaching")
    conversation.messages.append(
        Message(role="user", content="I want to become a backend engineer.")
    )
    db.add_all([goal, conversation])
    db.commit()
    return db, user.id, conversation.id


def test_context_is_included_in_prompt(client: TestClient) -> None:
    db, user_id, conversation_id = build_scenario(client)
    provider = MockProvider()

    generate_career_coach_response(
        db, user_id, conversation_id, "What should I learn next?", provider
    )

    assert provider.prompt is not None
    assert '"target_role": "Backend Engineer"' in provider.prompt
    assert '"name": "Ada"' in provider.prompt
    db.close()


def test_conversation_history_is_included(client: TestClient) -> None:
    db, user_id, conversation_id = build_scenario(client)
    provider = MockProvider()

    generate_career_coach_response(
        db, user_id, conversation_id, "What should I learn next?", provider
    )

    assert provider.prompt is not None
    assert "I want to become a backend engineer." in provider.prompt
    assert "What should I learn next?" in provider.prompt
    db.close()


def test_assistant_message_is_saved(client: TestClient) -> None:
    db, user_id, conversation_id = build_scenario(client)
    provider = MockProvider("Build a production API.")

    response = generate_career_coach_response(
        db, user_id, conversation_id, "Give me a project.", provider
    )

    db.expire_all()
    conversation = db.get(Conversation, conversation_id)
    assert response.content == "Build a production API."
    assert [message.role for message in conversation.messages] == [
        "user",
        "user",
        "assistant",
    ]
    assert conversation.messages[-1].content == response.content
    db.close()


def test_provider_failure_handling(client: TestClient) -> None:
    db, user_id, conversation_id = build_scenario(client)

    try:
        generate_career_coach_response(
            db,
            user_id,
            conversation_id,
            "What should I learn?",
            FailingProvider(),
        )
    except CareerCoachProviderError as exc:
        assert isinstance(exc.__cause__, RuntimeError)
    else:
        raise AssertionError("Expected provider failure")

    db.expire_all()
    conversation = db.get(Conversation, conversation_id)
    assert [message.role for message in conversation.messages] == ["user", "user"]
    db.close()
