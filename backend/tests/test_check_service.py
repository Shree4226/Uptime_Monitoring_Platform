import httpx

from app.models import User, Monitor
from app.security import hash_password
from app.services.check_service import perform_check, save_check


def create_monitor(db, **kwargs):
    user = User(
        email="service_test@example.com",
        username="service_test",
        hashed_password=hash_password("password123"),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    monitor_data = {
        "user_id": user.id,
        "name": "Test Monitor",
        "url": "https://example.com",
        "interval_seconds": 60,
        "expected_status": 200,
        "method": "GET",
        "timeout_seconds": 10,
        "retry_count": 0,
        "failure_threshold": 3,
        "is_active": True,
    }

    monitor_data.update(kwargs)

    monitor = Monitor(**monitor_data)

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return monitor


def test_perform_check_success(monkeypatch, db):
    monitor = create_monitor(db)

    class FakeResponse:
        status_code = 200

    def fake_request(**kwargs):
        return FakeResponse()

    monkeypatch.setattr(
        "app.services.check_service.httpx.request",
        fake_request,
    )

    result = perform_check(monitor)

    assert result["status_code"] == 200
    assert result["is_success"] is True
    assert result["response_time_ms"] is not None


def test_perform_check_wrong_status(monkeypatch, db):
    monitor = create_monitor(
        db,
        expected_status=200,
    )

    class FakeResponse:
        status_code = 500

    def fake_request(**kwargs):
        return FakeResponse()

    monkeypatch.setattr(
        "app.services.check_service.httpx.request",
        fake_request,
    )

    result = perform_check(monitor)

    assert result["status_code"] == 500
    assert result["is_success"] is False


def test_perform_check_request_error(monkeypatch, db):
    monitor = create_monitor(
        db,
        retry_count=0,
    )

    def fake_request(**kwargs):
        raise httpx.RequestError("Connection failed")

    monkeypatch.setattr(
        "app.services.check_service.httpx.request",
        fake_request,
    )

    result = perform_check(monitor)

    assert result["status_code"] is None
    assert result["response_time_ms"] is None
    assert result["is_success"] is False


def test_perform_check_retries_on_request_error(monkeypatch, db):
    monitor = create_monitor(
        db,
        retry_count=2,
    )

    attempts = 0

    def fake_request(**kwargs):
        nonlocal attempts
        attempts += 1
        raise httpx.RequestError("Connection failed")

    monkeypatch.setattr(
        "app.services.check_service.httpx.request",
        fake_request,
    )

    result = perform_check(monitor)

    assert attempts == 3
    assert result["is_success"] is False


def test_save_check(db):
    monitor = create_monitor(db)

    result = {
        "status_code": 200,
        "response_time_ms": 150,
        "is_success": True,
    }

    check = save_check(db, monitor, result)

    assert check.id is not None
    assert check.monitor_id == monitor.id
    assert check.status_code == 200
    assert check.response_time_ms == 150
    assert check.is_success is True