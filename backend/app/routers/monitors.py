from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import Monitor
from app.schemas import MonitorCreate


router = APIRouter(
    prefix="/monitors",
    tags=["Monitors"],
)


@router.post("/")
def create_monitor(
    monitor_data: MonitorCreate,
    db: Session = Depends(get_db),
):
    monitor = Monitor(
        name=monitor_data.name,
        url=str(monitor_data.url),
        interval_seconds=monitor_data.interval_seconds,
        expected_status=monitor_data.expected_status,
    )

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return {
        "id": monitor.id,
        "name": monitor.name,
        "url": monitor.url,
        "interval_seconds": monitor.interval_seconds,
        "expected_status": monitor.expected_status,
    }