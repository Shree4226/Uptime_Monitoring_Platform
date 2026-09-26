from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_register_user():
    response = client.post(
        "/auth/register",
        json={
            "email": "pytest_user_20260926@example.com",
            "username": "pytest_user_20260926",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "pytest_user_20260926@example.com"
    assert data["username"] == "pytest_user_20260926"