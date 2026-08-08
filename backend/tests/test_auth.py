from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.connection import Base, get_db
from app.main import app


@pytest.fixture
def client(tmp_path: Path) -> Generator[TestClient, None, None]:
    engine = create_engine(
        f"sqlite:///{tmp_path}/test.db",
        connect_args={"check_same_thread": False},
    )
    testing_session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db() -> Generator[Session, None, None]:
        db = testing_session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    engine.dispose()


def test_health(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "DevPath API"}


def test_signup_login_and_duplicate_rejection(client: TestClient) -> None:
    payload = {"name": "Ada Lovelace", "email": "ada@example.com", "password": "securepass"}
    signup = client.post("/auth/signup", json=payload)
    assert signup.status_code == 201
    assert signup.json() == {"id": 1, "name": "Ada Lovelace", "email": "ada@example.com"}
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
