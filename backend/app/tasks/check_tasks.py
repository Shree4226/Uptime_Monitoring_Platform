from datetime import datetime, timedelta
from app.celery_app import celery_app
from app.database import SessionLocal
from app.models import Monitor, Incident
from app.services.check_service import perform_check, save_check

import logging

logger = logging.getLogger(__name__)



@celery_app.task
def check_monitor(monitor_id: int):
    db = SessionLocal()

    try:
        monitor = (
            db.query(Monitor)
            .filter(
                Monitor.id == monitor_id,
                Monitor.is_active == True,
            )
            .first()
        )

        if not monitor:
            logger.warning(
                "Monitor not found or inactive: monitor_id=%s",
                monitor_id,
            )
            return {
                "success": False,
                "message": "Monitor not found",
            }

        logger.info(
            "Starting check for monitor_id=%s",
            monitor.id,
        )

        result = perform_check(monitor)

        check = save_check(
            db,
            monitor,
            result,
        )

        logger.info(
            "Check completed: monitor_id=%s, check_id=%s, status_code=%s, success=%s, response_time_ms=%s",
            monitor.id,
            check.id,
            check.status_code,
            check.is_success,
            check.response_time_ms,
        )

        if check.is_success:
            monitor.consecutive_failures = 0

            open_incident = (
                db.query(Incident)
                .filter(
                    Incident.monitor_id == monitor.id,
                    Incident.is_resolved == False,
                )
                .first()
            )

            if open_incident:
                open_incident.is_resolved = True
                open_incident.resolved_at = datetime.utcnow()
            
                logger.info(
                    "Incident resolved for monitor_id=%s",
                    monitor.id,
                )

        else:
            monitor.consecutive_failures += 1

            if monitor.consecutive_failures >= monitor.failure_threshold:
                open_incident = (
                    db.query(Incident)
                    .filter(
                        Incident.monitor_id == monitor.id,
                        Incident.is_resolved == False,
                    )
                    .first()
                )

                if not open_incident:
                    incident = Incident(
                        monitor_id=monitor.id,
                    )

                    db.add(incident)

                    logger.warning(
                        "Incident opened for monitor_id=%s after %s consecutive failures",
                        monitor.id,
                        monitor.consecutive_failures,
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
                
                logger.info(
                    "Scheduling first check for monitor_id=%s",
                    monitor.id,
                )
                continue

            next_check_time = (
                monitor.last_checked_at
                + timedelta(seconds=monitor.interval_seconds)
            )

            if now >= next_check_time:
                check_monitor.delay(monitor.id)

                logger.info(
                    "Scheduling check for monitor_id=%s",
                    monitor.id,
                )

    finally:
        db.close()