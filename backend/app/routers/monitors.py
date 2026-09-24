from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import Monitor


router = APIRouter(
    prefix="/monitors",
    tags=["Monitors"],
)


@router.post("/")
def create_monitor(
    db: Session = Depends(get_db),
):
    monitor = Monitor(
        name="Google",
        url="https://google.com",
    )

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return {
        "id": monitor.id,
        "name": monitor.name,
        "url": monitor.url,
    }