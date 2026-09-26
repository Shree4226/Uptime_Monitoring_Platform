from datetime import datetime

from app.models import Check, Incident, Monitor


def register_and_login(client, email, username):
    client.post(
        "/auth/register",
        json={
            "email": email,
            "username": username,
            "password": "password123",
        },
    )

    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "password123",
        },
    )

    return response.json()["access_token"]


def create_monitor(client, token, name="Test Monitor"):
    response = client.post(
        "/monitors/",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": name,
            "url": "https://example.com",
            "interval_seconds": 60,
            "expected_status": 200,
        },
    )

    return response


def test_create_monitor(client):
    token = register_and_login(
        client,
        "monitor_create@example.com",
        "monitor_create",
    )

    response = create_monitor(client, token, "Google Monitor")

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Google Monitor"
    assert data["url"] == "https://example.com/"
    assert data["interval_seconds"] == 60
    assert data["expected_status"] == 200
    assert data["method"] == "GET"
    assert data["timeout_seconds"] == 10
    assert data["retry_count"] == 0
    assert data["failure_threshold"] == 3
    assert data["is_active"] is True


def test_get_monitors(client):
    token = register_and_login(
        client,
        "monitor_list@example.com",
        "monitor_list",
    )

    create_monitor(client, token)

    response = client.get(
        "/monitors/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 1
    assert data[0]["name"] == "Test Monitor"
    assert data[0]["url"] == "https://example.com/"


def test_get_monitor_by_id(client):
    token = register_and_login(
        client,
        "monitor_get@example.com",
        "monitor_get",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    response = client.get(
        f"/monitors/{monitor_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == monitor_id
    assert data["name"] == "Test Monitor"
    assert data["url"] == "https://example.com/"


def test_update_monitor(client):
    token = register_and_login(
        client,
        "monitor_update@example.com",
        "monitor_update",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    response = client.put(
        f"/monitors/{monitor_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
        json={
            "name": "Updated Monitor",
            "url": "https://google.com",
            "interval_seconds": 120,
            "expected_status": 201,
            "method": "POST",
            "timeout_seconds": 20,
            "retry_count": 2,
            "failure_threshold": 5,
            "is_active": True,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["name"] == "Updated Monitor"
    assert data["url"] == "https://google.com/"
    assert data["interval_seconds"] == 120
    assert data["expected_status"] == 201
    assert data["method"] == "POST"
    assert data["timeout_seconds"] == 20
    assert data["retry_count"] == 2
    assert data["failure_threshold"] == 5


def test_update_monitor_status(client):
    token = register_and_login(
        client,
        "monitor_status@example.com",
        "monitor_status",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    response = client.patch(
        f"/monitors/{monitor_id}/status",
        headers={
            "Authorization": f"Bearer {token}",
        },
        params={
            "is_active": False,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == monitor_id
    assert data["is_active"] is False
    assert data["message"] == "Monitor status updated successfully"


def test_delete_monitor(client):
    token = register_and_login(
        client,
        "monitor_delete@example.com",
        "monitor_delete",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    response = client.delete(
        f"/monitors/{monitor_id}",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["id"] == monitor_id
    assert data["message"] == "Monitor deleted successfully"

    get_response = client.get(
        "/monitors/",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert get_response.status_code == 200
    assert len(get_response.json()) == 0


def test_get_monitor_checks(client):
    token = register_and_login(
        client,
        "monitor_checks@example.com",
        "monitor_checks",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    response = client.get(
        f"/monitors/{monitor_id}/checks",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200
    assert response.json() == []


def test_monitor_analytics(client, db):
    token = register_and_login(
        client,
        "monitor_analytics@example.com",
        "monitor_analytics",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    db.add_all(
        [
            Check(
                monitor_id=monitor_id,
                status_code=200,
                response_time_ms=100,
                is_success=True,
            ),
            Check(
                monitor_id=monitor_id,
                status_code=500,
                response_time_ms=300,
                is_success=False,
            ),
        ]
    )

    db.commit()

    response = client.get(
        f"/monitors/{monitor_id}/analytics",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["total_checks"] == 2
    assert data["successful_checks"] == 1
    assert data["failed_checks"] == 1
    assert data["uptime_percentage"] == 50.0
    assert data["average_response_time_ms"] == 200.0
    assert data["min_response_time_ms"] == 100
    assert data["max_response_time_ms"] == 300


def test_monitor_analytics_invalid_period(client):
    token = register_and_login(
        client,
        "monitor_invalid_period@example.com",
        "monitor_invalid_period",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    response = client.get(
        f"/monitors/{monitor_id}/analytics",
        params={
            "period": "invalid",
        },
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 400
    assert "Invalid period" in response.json()["detail"]


def test_monitor_timeseries(client, db):
    token = register_and_login(
        client,
        "monitor_timeseries@example.com",
        "monitor_timeseries",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    db.add(
        Check(
            monitor_id=monitor_id,
            status_code=200,
            response_time_ms=150,
            is_success=True,
        )
    )

    db.commit()

    response = client.get(
        f"/monitors/{monitor_id}/analytics/timeseries",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["period"] == "24h"
    assert len(data["data"]) == 1
    assert data["data"][0]["response_time_ms"] == 150
    assert data["data"][0]["is_success"] is True


def test_bucketed_timeseries(client, db):
    token = register_and_login(
        client,
        "monitor_bucketed@example.com",
        "monitor_bucketed",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    db.add(
        Check(
            monitor_id=monitor_id,
            status_code=200,
            response_time_ms=200,
            is_success=True,
        )
    )

    db.commit()

    response = client.get(
        f"/monitors/{monitor_id}/analytics/timeseries/bucketed",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["period"] == "24h"
    assert data["interval_minutes"] == 5
    assert len(data["data"]) == 1
    assert data["data"][0]["total_checks"] == 1
    assert data["data"][0]["uptime_percentage"] == 100.0
    assert data["data"][0]["average_response_time_ms"] == 200.0


def test_monitor_incidents(client, db):
    token = register_and_login(
        client,
        "monitor_incidents@example.com",
        "monitor_incidents",
    )

    create_response = create_monitor(client, token)

    monitor_id = create_response.json()["id"]

    db.add(
        Incident(
            monitor_id=monitor_id,
            started_at=datetime.utcnow(),
            is_resolved=False,
        )
    )

    db.commit()

    response = client.get(
        f"/monitors/{monitor_id}/incidents",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert "incidents" in data
    assert len(data["incidents"]) == 1
    assert data["incidents"][0]["monitor_id"] == monitor_id
    assert data["incidents"][0]["is_resolved"] is False

def test_get_monitor_not_found(client):
    token = register_and_login(
        client,
        "monitor_not_found@example.com",
        "monitor_not_found",
    )

    response = client.get(
        "/monitors/999999",
        headers={
            "Authorization": f"Bearer {token}",
        },
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Monitor not found"