from app.models import User, Monitor, Check, Incident
from app.security import hash_password
from app.tasks.check_tasks import check_monitor

def use_test_db(monkeypatch, db):
    monkeypatch.setattr(
        "app.tasks.check_tasks.SessionLocal",
        lambda: db,
    )


def create_monitor(db, **kwargs):
    user = User(
        email="task_test@example.com",
        username="task_test",
        hashed_password=hash_password("password123"),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    monitor_data = {
        "user_id": user.id,
        "name": "Task Test Monitor",
        "url": "https://example.com",
        "interval_seconds": 60,
        "expected_status": 200,
        "method": "GET",
        "timeout_seconds": 10,
        "retry_count": 0,
        "failure_threshold": 3,
        "is_active": True,
        "consecutive_failures": 0,
    }

    monitor_data.update(kwargs)

    monitor = Monitor(**monitor_data)

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return monitor


def test_check_monitor_success(monkeypatch, db):
    monitor = create_monitor(db)
    use_test_db(monkeypatch, db)

    def fake_perform_check(monitor):
        return {
            "status_code": 200,
            "response_time_ms": 120,
            "is_success": True,
        }

    monkeypatch.setattr(
        "app.tasks.check_tasks.perform_check",
        fake_perform_check,
    )

    result = check_monitor(monitor.id)

    assert result["success"] is True
    assert result["monitor_id"] == monitor.id
    assert result["status_code"] == 200
    assert result["is_success"] is True

    check = db.query(Check).filter(
        Check.monitor_id == monitor.id
    ).first()

    assert check is not None
    assert check.status_code == 200
    assert check.is_success is True

    updated_monitor = db.get(Monitor, monitor.id)

    assert updated_monitor.consecutive_failures == 0
    assert updated_monitor.last_checked_at is not None


def test_check_monitor_failure_opens_incident(monkeypatch, db):
    monitor = create_monitor(
        db,
        failure_threshold=2,
    )
    use_test_db(monkeypatch, db)

    def fake_perform_check(monitor):
        return {
            "status_code": 500,
            "response_time_ms": 200,
            "is_success": False,
        }

    monkeypatch.setattr(
        "app.tasks.check_tasks.perform_check",
        fake_perform_check,
    )

    first_result = check_monitor(monitor.id)

    assert first_result["is_success"] is False

    updated_monitor = db.get(Monitor, monitor.id)

    assert updated_monitor.consecutive_failures == 1

    incident = db.query(Incident).filter(
        Incident.monitor_id == monitor.id
    ).first()

    assert incident is None

    second_result = check_monitor(monitor.id)

    assert second_result["is_success"] is False

    updated_monitor = db.get(Monitor, monitor.id)

    assert updated_monitor.consecutive_failures == 2

    incident = db.query(Incident).filter(
        Incident.monitor_id == monitor.id
    ).first()

    assert incident is not None
    assert incident.is_resolved is False
    assert incident.resolved_at is None


def test_check_monitor_resolves_incident(monkeypatch, db):
    monitor = create_monitor(
        db,
        failure_threshold=1,
    )
    use_test_db(monkeypatch, db)

    def fake_failed_check(monitor):
        return {
            "status_code": 500,
            "response_time_ms": 200,
            "is_success": False,
        }

    monkeypatch.setattr(
        "app.tasks.check_tasks.perform_check",
        fake_failed_check,
    )

    check_monitor(monitor.id)

    incident = db.query(Incident).filter(
        Incident.monitor_id == monitor.id
    ).first()

    assert incident is not None
    assert incident.is_resolved is False

    def fake_successful_check(monitor):
        return {
            "status_code": 200,
            "response_time_ms": 100,
            "is_success": True,
        }

    monkeypatch.setattr(
        "app.tasks.check_tasks.perform_check",
        fake_successful_check,
    )

    result = check_monitor(monitor.id)

    assert result["is_success"] is True

    resolved_incident = db.query(Incident).filter(
        Incident.monitor_id == monitor.id
    ).first()

    assert resolved_incident is not None
    assert resolved_incident.is_resolved is True
    assert resolved_incident.resolved_at is not None

    updated_monitor = db.get(Monitor, monitor.id)

    assert updated_monitor.consecutive_failures == 0


def test_check_monitor_inactive_monitor(db):
    monitor = create_monitor(
        db,
        is_active=False,
    )

    result = check_monitor(monitor.id)

    assert result["success"] is False
    assert result["message"] == "Monitor not found"

    check = db.query(Check).filter(
        Check.monitor_id == monitor.id
    ).first()

    assert check is None