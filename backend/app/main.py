from fastapi import FastAPI
from app.config import settings
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Uptime Monitoring Platform API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name
    }