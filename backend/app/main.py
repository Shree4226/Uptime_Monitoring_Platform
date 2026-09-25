from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables

from app.config import settings

from app.routers.health import router as health_router
from app.routers.monitors import router as monitors_router
from app.routers.checks import router as checks_router
from app.routers.auth import router as auth_router

app = FastAPI(title=settings.app_name)
create_tables()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(monitors_router)
app.include_router(checks_router)
app.include_router(auth_router)

