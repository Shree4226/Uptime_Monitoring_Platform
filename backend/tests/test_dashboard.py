def test_dashboard_summary(client, db):
    client.post(
        "/auth/register",
        json={
            "email": "dashboard_test@example.com",
            "username": "dashboard_test",
            "password": "password123",
        },
    )

    login_response = client.post(
        "/auth/login",
        json={
            "email": "dashboard_test@example.com",
            "password": "password123",
        },
    )

    token = login_response.json()["access_token"]

    client.post(
        "/monitors/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Dashboard Monitor",
            "url": "https://example.com",
        },
    )

    response = client.get(
        "/dashboard/summary",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_monitors"] == 1
    assert data["active_monitors"] == 1
    assert data["paused_monitors"] == 0
    assert data["active_incidents"] == 0
    assert data["overall_uptime_percentage"] == 0.0
    assert data["average_response_time_ms"] is None