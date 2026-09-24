from celery import Celery

from app.config import settings


celery_app = Celery(
    "uptime_monitor",
    broker=settings.redis_broker_url,
    backend=settings.redis_backend_url,
)