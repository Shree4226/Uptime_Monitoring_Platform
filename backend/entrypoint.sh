#!/bin/sh

echo "Launching low-memory Celery setup..."

# Start Celery Worker
celery -A app.celery_app.celery_app worker --loglevel=info --concurrency=1 --max-tasks-per-child=100 &

# Start Celery Beat
celery -A app.celery_app.celery_app beat --loglevel=info &

echo "Launching API Web Server..."

# Start FastAPI in the foreground
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"