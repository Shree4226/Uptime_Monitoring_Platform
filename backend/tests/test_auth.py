def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "pytest_user_20260927@example.com",
            "username": "pytest_user_20260927",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["email"] == "pytest_user_20260927@example.com"
    assert data["username"] == "pytest_user_20260927"

def test_login_user(client):
    client.post(
        "/auth/register",
        json={
            "email": "pytest_login@example.com",
            "username": "pytest_login",
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": "pytest_login@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"