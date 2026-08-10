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


VALID_ANALYSIS = {
    "career_stage": "Early Backend Engineer Path",
    "readiness_score": 62,
    "strengths": [
        {
            "area": "Backend Development",
            "explanation": "Strong API foundation",
        }
    ],
    "weaknesses": ["Distributed systems"],
    "skill_priorities": [
        {
            "skill": "System Design",
            "priority": "High",
            "reason": "Required for the target role",
        }
    ],
    "next_actions": ["Build a production API"],
}


class MockProvider(AIProvider):
    def __init__(self, response: str | None = None) -> None:
        self.response = response or json.dumps(VALID_ANALYSIS)
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
) -> tuple[dict[str, str], int]:
    db = database_session(client)
    user = User(name=name, email=email, password_hash="hash")
    role = Role(title=role_title)
    db.add(CareerGoal(name=f"{name} goal", user=user, role=role))
    db.commit()
    headers = {
        "Authorization": f"Bearer {create_access_token({'sub': str(user.id)})}"
    }
    user_id = user.id
    db.close()
    return headers, user_id


def override_provider(client: TestClient, provider: AIProvider) -> None:
    client.app.dependency_overrides[get_ai_provider] = lambda: provider


def test_endpoint_requires_authentication(client: TestClient) -> None:
    override_provider(client, MockProvider())

    response = client.post("/api/v1/intelligence/analyze", json={})

    assert response.status_code == 401


def test_successful_analysis_generation(client: TestClient) -> None:
    headers, _ = create_user(
        client, "Ada", "ada-intelligence@example.com", "Backend Engineer"
    )
    provider = MockProvider()
    override_provider(client, provider)

    response = client.post(
        "/api/v1/intelligence/analyze",
        json={"focus": "deployment readiness"},
        headers=headers,
    )

    assert response.status_code == 200
    assert response.json() == VALID_ANALYSIS
    assert "deployment readiness" in provider.prompts[0]
    assert '"target_role": "Backend Engineer"' in provider.prompts[0]


def test_user_data_isolation(client: TestClient) -> None:
    ada_headers, _ = create_user(
        client, "Ada", "ada-isolation@example.com", "Backend Engineer"
    )
    create_user(client, "Lin", "lin-isolation@example.com", "Data Scientist")
    provider = MockProvider()
    override_provider(client, provider)

    response = client.post(
        "/api/v1/intelligence/analyze", json={}, headers=ada_headers
    )

    assert response.status_code == 200
    assert "Backend Engineer" in provider.prompts[0]
    assert "Data Scientist" not in provider.prompts[0]
    assert "Lin" not in provider.prompts[0]


def test_gemini_failure_handling(client: TestClient) -> None:
    headers, _ = create_user(
        client, "Ada", "ada-failure@example.com", "Backend Engineer"
    )
    override_provider(client, FailingProvider())

    response = client.post(
        "/api/v1/intelligence/analyze", json={}, headers=headers
    )

    assert response.status_code == 502
    assert response.json() == {
        "detail": "AI provider failed to generate a valid career analysis"
    }


def test_response_schema_validation(client: TestClient) -> None:
    headers, _ = create_user(
        client, "Ada", "ada-schema@example.com", "Backend Engineer"
    )
    invalid = {**VALID_ANALYSIS, "readiness_score": 101}
    override_provider(client, MockProvider(json.dumps(invalid)))

    response = client.post(
        "/api/v1/intelligence/analyze", json={}, headers=headers
    )

    assert response.status_code == 502
