from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.models import Monitor
from app.schemas import MonitorCreate, MonitorResponse, MonitorStatusResponse


router = APIRouter(
    prefix="/monitors",
    tags=["Monitors"],
)


@router.post("/", response_model=MonitorResponse)
def create_monitor(
    monitor_data: MonitorCreate,
    db: Session = Depends(get_db),
):
    monitor = Monitor(
        name=monitor_data.name,
        url=str(monitor_data.url),
        interval_seconds=monitor_data.interval_seconds,
        expected_status=monitor_data.expected_status,
        is_active=monitor_data.is_active,
    )

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    return monitor

@router.get("/", response_model=list[MonitorResponse])
def get_monitors(db: Session = Depends(get_db)):
    monitors = db.query(Monitor).all()

    return monitors

@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    return monitor

@router.delete("/{monitor_id}")
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    db.delete(monitor)
    db.commit()

    return {
        "message": "Monitor deleted successfully",
        "id": monitor_id,
    }

@router.put("/{monitor_id}", response_model=MonitorResponse)
def update_monitor(
    monitor_id: int,
    monitor_data: MonitorCreate,
    db: Session = Depends(get_db),
):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    monitor.name = monitor_data.name
    monitor.url = str(monitor_data.url)
    monitor.interval_seconds = monitor_data.interval_seconds
    monitor.expected_status = monitor_data.expected_status

    db.commit()
    db.refresh(monitor)

    return monitor

@router.patch("/{monitor_id}/status",response_model=MonitorStatusResponse)
def update_monitor_status(
    monitor_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
):
    monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    monitor.is_active = is_active

    db.commit()
    db.refresh(monitor)

    return {
        "id": monitor.id,
        "is_active": monitor.is_active,
        "message": "Monitor status updated successfully",
    }