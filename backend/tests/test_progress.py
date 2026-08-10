from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.security import create_access_token
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.models.role import Role
from app.models.user import User


def database_session(client: TestClient) -> Session:
    return next(client.app.dependency_overrides[get_db]())


def build_roadmaps(
    client: TestClient,
) -> tuple[dict[str, str], dict[str, str], int, list[int], int]:
    db = database_session(client)
    owner = User(name="Ada", email="ada-progress@example.com", password_hash="hash")
    other = User(name="Lin", email="lin-progress@example.com", password_hash="hash")
    role = Role(title="Backend Engineer")
    owner_goal = CareerGoal(name="Ada progress goal", user=owner, role=role)
    other_goal = CareerGoal(name="Lin progress goal", user=other, role=role)
    owner_roadmap = Roadmap(career_goal=owner_goal, title="Ada roadmap")
    owner_roadmap.steps.extend(
        [
            RoadmapStep(title="First", order=1),
            RoadmapStep(title="Second", order=2),
            RoadmapStep(title="Third", order=3),
        ]
    )
    other_roadmap = Roadmap(career_goal=other_goal, title="Lin roadmap")
    other_roadmap.steps.append(RoadmapStep(title="Private", order=1))
    db.add_all([owner_roadmap, other_roadmap])
    db.commit()
    result = (
        {"Authorization": f"Bearer {create_access_token({'sub': str(owner.id)})}"},
        {"Authorization": f"Bearer {create_access_token({'sub': str(other.id)})}"},
        owner_roadmap.id,
        [step.id for step in owner_roadmap.steps],
        other_roadmap.steps[0].id,
    )
    db.close()
    return result


def test_user_updates_step_progress(client: TestClient) -> None:
    owner_headers, _, _, step_ids, _ = build_roadmaps(client)

    response = client.put(
        f"/api/v1/progress/{step_ids[0]}",
        json={"status": "completed"},
        headers=owner_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "completed"
    assert response.json()["completed_at"] is not None


def test_user_retrieves_own_progress(client: TestClient) -> None:
    owner_headers, other_headers, _, step_ids, other_step_id = build_roadmaps(client)
    client.put(
        f"/api/v1/progress/{step_ids[0]}",
        json={"status": "in_progress"},
        headers=owner_headers,
    )
    client.put(
        f"/api/v1/progress/{other_step_id}",
        json={"status": "completed"},
        headers=other_headers,
    )

    response = client.get("/api/v1/progress/me", headers=owner_headers)

    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["step_id"] == step_ids[0]
    assert response.json()[0]["status"] == "in_progress"


def test_completion_percentage_calculates_correctly(client: TestClient) -> None:
    owner_headers, _, roadmap_id, step_ids, _ = build_roadmaps(client)
    for step_id in step_ids[:2]:
        client.put(
            f"/api/v1/progress/{step_id}",
            json={"status": "completed"},
            headers=owner_headers,
        )

    response = client.get(
        f"/api/v1/progress/roadmap/{roadmap_id}", headers=owner_headers
    )

    assert response.status_code == 200
    assert response.json() == {
        "roadmap_id": roadmap_id,
        "completed_steps": 2,
        "total_steps": 3,
        "completion_percentage": 66.67,
    }


def test_user_cannot_update_another_users_step(client: TestClient) -> None:
    owner_headers, _, _, _, other_step_id = build_roadmaps(client)

    response = client.put(
        f"/api/v1/progress/{other_step_id}",
        json={"status": "completed"},
        headers=owner_headers,
    )

    assert response.status_code == 404


def test_progress_endpoints_require_authentication(client: TestClient) -> None:
    assert client.put("/api/v1/progress/1", json={"status": "completed"}).status_code == 401
    assert client.get("/api/v1/progress/me").status_code == 401
    assert client.get("/api/v1/progress/roadmap/1").status_code == 401


def test_invalid_step_returns_404(client: TestClient) -> None:
    owner_headers, _, _, _, _ = build_roadmaps(client)

    response = client.put(
        "/api/v1/progress/999",
        json={"status": "completed"},
        headers=owner_headers,
    )

    assert response.status_code == 404
