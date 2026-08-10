import json

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.role import Role
from app.models.user import User


VALID_WEEKLY_PLAN = {
    "week_number": 1,
    "focus_area": "Backend Deployment Foundations",
    "summary": "This week focuses on closing the deployment gap.",
    "tasks": [
        {
            "title": "Learn Docker fundamentals",
            "description": "Learn images, containers, Dockerfiles, ports, and volumes.",
            "estimated_hours": 3.0,
            "priority": "High",
            "skill_focus": "Docker",
        }
    ],
    "expected_outcomes": [
        "Understand container fundamentals",
        "Containerize a small backend service",
    ],
    "confidence_score": 86,
}


class MockProvider(AIProvider):
    def __init__(self, response: str | None = None) -> None:
        self.response = response or json.dumps(VALID_WEEKLY_PLAN)
        self.prompts: list[str] = []

    def generate(self, prompt: str) -> str:
        self.prompts.append(prompt)
        return self.response


class FailingProvider(AIProvider):
    def generate(self, prompt: str) -> str:
        raise RuntimeError("Gemini unavailable")


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def create_user(
    client: TestClient, name: str, email: str, role_title: str
) -> dict[str, str]:
    db = database_session(client)
    user = User(name=name, email=email, password_hash="hash")
    role = Role(title=role_title)
    db.add(CareerGoal(name=f"{name} goal", user=user, role=role))
    db.commit()
    headers = {
        "Authorization": f"Bearer {create_access_token({'sub': str(user.id)})}"
    }
    db.close()
    return headers


def override_provider(client: TestClient, provider: AIProvider) -> None:
    client.app.dependency_overrides[get_ai_provider] = lambda: provider


def test_endpoint_requires_authentication(client: TestClient) -> None:
    override_provider(client, MockProvider())

    response = client.post("/api/v1/planner/weekly-plan")

    assert response.status_code == 401


def test_successful_weekly_plan_uses_authenticated_context(
    client: TestClient,
) -> None:
    headers = create_user(
        client, "Ada", "ada-weekly-planner@example.com", "Backend Engineer"
    )
    provider = MockProvider()
    override_provider(client, provider)

    response = client.post("/api/v1/planner/weekly-plan", headers=headers)

    assert response.status_code == 200
    assert response.json() == VALID_WEEKLY_PLAN
    assert '"name": "Ada"' in provider.prompts[0]
    assert '"target_role": "Backend Engineer"' in provider.prompts[0]


def test_user_data_isolation(client: TestClient) -> None:
    ada_headers = create_user(
        client,
        "Ada",
        "ada-weekly-isolation@example.com",
        "Backend Engineer",
    )
    create_user(
        client,
        "Lin",
        "lin-weekly-isolation@example.com",
        "Data Scientist",
    )
    provider = MockProvider()
    override_provider(client, provider)

    response = client.post("/api/v1/planner/weekly-plan", headers=ada_headers)

    assert response.status_code == 200
    assert "Backend Engineer" in provider.prompts[0]
    assert "Data Scientist" not in provider.prompts[0]
    assert '"name": "Lin"' not in provider.prompts[0]


def test_provider_failure_returns_bad_gateway(client: TestClient) -> None:
    headers = create_user(
        client, "Ada", "ada-weekly-failure@example.com", "Backend Engineer"
    )
    override_provider(client, FailingProvider())

    response = client.post("/api/v1/planner/weekly-plan", headers=headers)

    assert response.status_code == 502
    assert response.json() == {
        "detail": "AI provider failed to generate a valid weekly learning plan"
    }


def test_invalid_ai_response_returns_bad_gateway(client: TestClient) -> None:
    headers = create_user(
        client, "Ada", "ada-weekly-invalid@example.com", "Backend Engineer"
    )
    override_provider(client, MockProvider("not valid JSON"))

    response = client.post("/api/v1/planner/weekly-plan", headers=headers)

    assert response.status_code == 502
    assert response.json() == {
        "detail": "AI provider failed to generate a valid weekly learning plan"
    }
