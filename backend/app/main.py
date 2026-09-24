from fastapi import FastAPI
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware
from app.routers import router

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
