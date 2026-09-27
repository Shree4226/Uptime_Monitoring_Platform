#!/bin/sh
set -e

echo "Waiting for database to be reachable..."
python -c "
import os, sys, time
import psycopg

url = os.environ['DATABASE_URL']
for i in range(30):
    try:
        psycopg.connect(url, connect_timeout=3).close()
        print('Database is reachable')
        break
    except Exception as e:
        print(f'DB not ready ({i+1}/30): {e}')
        time.sleep(2)
else:
    print('Database never became reachable, exiting')
    sys.exit(1)
"

echo "Launching low-memory Celery setup..."
celery -A app.celery_app.celery_app worker --loglevel=info --concurrency=1 --max-tasks-per-child=100 &
celery -A app.celery_app.celery_app beat --loglevel=info &

echo "Launching API Web Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"