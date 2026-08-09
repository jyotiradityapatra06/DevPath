from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.database.seed_resources import seed_learning_resources
from app.models.learning_resource import LearningResource
from app.models.skill import Skill


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def test_fetch_resources_by_skill_and_idempotent_seed(client: TestClient) -> None:
    db = database_session(client)
    skill = Skill(name="FastAPI", category="Backend Framework", difficulty="Advanced")
    db.add(skill)
    db.commit()

    seed_learning_resources(db)
    seed_learning_resources(db)

    count = db.scalar(select(func.count()).select_from(LearningResource))
    assert count == 2
    skill_id = skill.id
    db.close()

    response = client.get(f"/api/v1/skills/{skill_id}/resources")
    assert response.status_code == 200
    assert response.json()["skill"] == "FastAPI"
    assert [item["title"] for item in response.json()["resources"]] == [
        "FastAPI Documentation",
        "FastAPI Full Course",
    ]
    assert response.json()["resources"][0] == {
        "title": "FastAPI Documentation",
        "provider": "FastAPI",
        "type": "Documentation",
        "difficulty": "Intermediate",
        "rating": 5.0,
    }


def test_resources_for_unknown_skill_return_404(client: TestClient) -> None:
    assert client.get("/api/v1/skills/999/resources").status_code == 404
