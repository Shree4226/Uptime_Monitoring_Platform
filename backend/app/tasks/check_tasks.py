from datetime import datetime, timedelta
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Monitor
from app.services.check_service import perform_check, save_check


@celery_app.task
def check_monitor(monitor_id: int):
    db = SessionLocal()

    try:
        monitor = (
            db.query(Monitor)
            .filter(Monitor.id == monitor_id)
            .first()
        )

        if not monitor:
            return {
                "success": False,
                "message": "Monitor not found",
            }

        result = perform_check(monitor)

        check = save_check(
            db,
            monitor,
            result,
        )

        monitor.last_checked_at = datetime.utcnow()
        db.commit()

        return {
            "success": True,
            "monitor_id": monitor.id,
            "check_id": check.id,
            "status_code": check.status_code,
            "response_time_ms": check.response_time_ms,
            "is_success": check.is_success,
        }

    finally:
        db.close()

@celery_app.task
def schedule_monitor_checks():
    db = SessionLocal()

    try:
        monitors = (
            db.query(Monitor)
            .filter(Monitor.is_active == True)
            .all()
        )

        now = datetime.utcnow()

        for monitor in monitors:
            if monitor.last_checked_at is None:
                check_monitor.delay(monitor.id)
                continue

            next_check_time = (
                monitor.last_checked_at
                + timedelta(seconds=monitor.interval_seconds)
            )

            if now >= next_check_time:
                check_monitor.delay(monitor.id)

    finally:
        db.close()