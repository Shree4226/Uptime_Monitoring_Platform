from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def root():
    return {"message": "Uptime Monitoring Platform API"}


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
    }