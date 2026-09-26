def test_create_monitor(client):
    client.post(
        "/auth/register",
        json={
            "email": "monitor_test@example.com",
            "username": "monitor_test",
            "password": "password123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "monitor_test@example.com",
            "password": "password123",
        },
    )

    token = login_response.json()["access_token"]

    response = client.post(
        "/monitors/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Google Monitor",
            "url": "https://www.google.com",
            "interval_seconds": 60,
            "expected_status": 200,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Google Monitor"
    assert data["url"] == "https://www.google.com/"
    assert data["interval_seconds"] == 60
    assert data["expected_status"] == 200
    assert data["method"] == "GET"
    assert data["timeout_seconds"] == 10
    assert data["retry_count"] == 0
    assert data["failure_threshold"] == 3
    assert data["is_active"] is True