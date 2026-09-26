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