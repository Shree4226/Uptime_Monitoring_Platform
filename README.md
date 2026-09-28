# Uptime Monitoring Platform

A full-stack uptime monitoring service for tracking HTTP endpoints, recent checks, response times, and incidents. The application includes a React dashboard, a FastAPI API, PostgreSQL persistence, and scheduled checks delivered through Celery and Redis.

## Features

- Register and sign in with bearer-token authentication.
- Create, edit, pause, resume, sort, and delete HTTP monitors.
- Configure request method, expected status, interval, timeout, retries, and failure threshold.
- Review dashboard health summaries, monitor analytics, response-time history, incidents, and paginated checks.
- Schedule monitor checks in the background with Celery Beat and Redis.
- Run the service locally with Docker Compose or deploy using the included Render blueprint.

## Stack

- Frontend: React, TypeScript, Vite, React Router, Axios, and Recharts.
- API: FastAPI, SQLAlchemy, Pydantic, and PostgreSQL.
- Background jobs: Celery and Redis.
- Deployment: Docker and Render.

## Requirements

- Docker Desktop with Docker Compose, for the containerized setup.
- Node.js and npm, for the frontend development server.
- Python 3.13 and PostgreSQL/Redis, if running the backend directly on the host.

## Run Locally

### 1. Configure the backend containers

Create `.env.docker` in the repository root. This file is read by the backend and Celery services in `docker-compose.yml`:

```dotenv
DATABASE_URL=postgresql+psycopg://uptime_user:uptime_password@postgres:5432/uptime_db
REDIS_BROKER_URL=redis://redis:6379/0
REDIS_BACKEND_URL=redis://redis:6379/1
SECRET_KEY=replace-with-a-long-random-local-development-secret
FRONTEND_URL=http://localhost:5173
```

These values are for local development only. Use unique credentials and a securely generated `SECRET_KEY` in deployed environments; do not commit environment files or production secrets.

Start PostgreSQL, Redis, and the backend:

```bash
docker compose up --build -d postgres redis backend
```

The backend container entrypoint starts the API and its Celery worker and beat scheduler. The separate `celery-worker` and `celery-beat` Compose services are available for alternate deployments; do not start them alongside this entrypoint unless you intend to run additional workers/schedulers.

The API is available at `http://localhost:8000`. Check `http://localhost:8000/health` for API/database health and `http://localhost:8000/docs` for interactive API documentation.

### 2. Configure and run the frontend

In a second terminal:

```bash
cd frontend
```

Copy `.env.example` to `.env.local` and set the API base URL:

```dotenv
VITE_API_URL=http://localhost:8000
```

Install dependencies and start Vite:

```bash
npm ci
npm run dev
```

Open `http://localhost:5173`. The API's `FRONTEND_URL` must match the frontend origin so the browser requests pass CORS checks.

### Stop local services

```bash
docker compose down
```

Add `-v` only if you intentionally want to delete the PostgreSQL data volume.

## API Overview

Interactive documentation is served by FastAPI at `/docs` (OpenAPI JSON at `/openapi.json`). Authenticated routes use the `Authorization: Bearer <token>` header.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Register a user |
| `POST` | `/auth/login` | Obtain an access token |
| `GET` | `/auth/me` | Get the current user |
| `GET` | `/health` | Check API and database health |
| `GET` | `/dashboard/summary` | Get the current user's dashboard totals |
| `GET`, `POST` | `/monitors/` | List or create monitors |
| `GET`, `PUT`, `DELETE` | `/monitors/{monitor_id}` | Read, update, or delete one monitor |
| `PATCH` | `/monitors/{monitor_id}/status` | Activate or pause a monitor |
| `GET` | `/monitors/{monitor_id}/checks` | Get paginated check history |
| `GET` | `/monitors/{monitor_id}/analytics` | Get period analytics (`1h`, `24h`, `7d`, `30d`) |
| `GET` | `/monitors/{monitor_id}/analytics/timeseries` | Get response-time series |
| `GET` | `/monitors/{monitor_id}/analytics/timeseries/bucketed` | Get bucketed analytics series |
| `GET` | `/monitors/{monitor_id}/incidents` | Get incident history |

## Checks

Frontend quality checks run from `frontend/`:

```bash
npm run lint
npm run build
```

Backend tests use `pytest` from `backend/`. Configure the required backend environment variables and point `TEST_DATABASE_URL` at a dedicated PostgreSQL test database before running them; tests recreate their tables.

## Deployment

The root `render.yaml` describes the Render services for the FastAPI backend, static Vite frontend, Redis, and PostgreSQL. Review the generated service URLs and environment variables in Render before deployment. The backend's `FRONTEND_URL` must match the deployed frontend origin, and the frontend's `VITE_API_URL` must point to the deployed API.

## Project Layout

```text
backend/   FastAPI application, database models, Celery tasks, and tests
frontend/  React and TypeScript single-page application
docker-compose.yml  Local PostgreSQL, Redis, API, and worker services
render.yaml         Render deployment blueprint
```
