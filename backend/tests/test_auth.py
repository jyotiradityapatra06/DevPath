from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "DevPath API"}


def test_signup_login_and_duplicate_rejection(client: TestClient) -> None:
    payload = {"name": "Ada Lovelace", "email": "ada@example.com", "password": "securepass"}
    signup = client.post("/auth/signup", json=payload)
    assert signup.status_code == 201
    assert signup.json() == {"id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "onboarding_completed": False}
    assert "password_hash" not in signup.json()

    duplicate = client.post("/auth/signup", json=payload)
    assert duplicate.status_code == 409

    login = client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"
    assert login.json()["access_token"]


def test_login_rejects_invalid_credentials(client: TestClient) -> None:
    response = client.post("/auth/login", json={"email": "missing@example.com", "password": "wrong"})
    assert response.status_code == 401


def test_current_user_returns_authenticated_user(client: TestClient) -> None:
    payload = {"name": "Ada Lovelace", "email": "ada@example.com", "password": "securepass"}
    client.post("/auth/signup", json=payload)
    login = client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]})

    response = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {login.json()['access_token']}"},
    )

    assert response.status_code == 200
    assert response.json() == {"id": 1, "name": "Ada Lovelace", "email": "ada@example.com", "onboarding_completed": False}


def test_current_user_rejects_missing_token(client: TestClient) -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401
