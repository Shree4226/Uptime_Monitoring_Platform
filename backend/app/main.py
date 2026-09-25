from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_tables

from app.config import settings

from app.routers.health import router as health_router
from app.routers.monitors import router as monitors_router
from app.routers.checks import router as checks_router
from app.routers.auth import router as auth_router

from fastapi import Depends

from app.auth_dependencies import get_current_user
from app.models import User

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

@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "created_at": current_user.created_at,
    }

 

