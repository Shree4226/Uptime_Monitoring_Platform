from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables

from app.config import settings

from app.routers.health import router as health_router
from app.routers.monitors import router as monitors_router
from app.routers.checks import router as checks_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router

from app.auth_dependencies import get_current_user
from app.models import User

from app.logging_config import setup_logging

setup_logging()

app = FastAPI(title=settings.app_name)

@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error"
        },
    )


create_tables()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(monitors_router)
app.include_router(checks_router)
app.include_router(auth_router)
app.include_router(dashboard_router)

@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at,
    }

 
