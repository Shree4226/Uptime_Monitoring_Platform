from celery import Celery

from app.config import settings


celery_app = Celery(
    "uptime_monitor",
    broker=settings.redis_broker_url,
    backend=settings.redis_backend_url,
    include=["app.tasks.check_tasks"],
)

celery_app.conf.beat_schedule = {
    "schedule-monitor-checks": {
        "task": "app.tasks.check_tasks.schedule_monitor_checks",
        "schedule": 10.0,
    },
}