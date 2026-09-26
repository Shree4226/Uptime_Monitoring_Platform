import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.dependencies import get_db
from app.models import Monitor, User, Check, Incident
from app.schemas import (
    MonitorCreate,
    MonitorResponse,
    MonitorStatusResponse,
    MonitorDeleteResponse,
    CheckResponse,
    MonitorAnalyticsResponse,
    MonitorTimeseriesResponse,
    MonitorBucketedTimeseriesResponse,
    IncidentListResponse,
)
from app.auth_dependencies import get_current_user

router = APIRouter(
    prefix="/monitors",
    tags=["Monitors"],
)


@router.post("/", response_model=MonitorResponse)
def create_monitor(
    monitor_data: MonitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = Monitor(
        user_id=current_user.id,
        name=monitor_data.name,
        url=str(monitor_data.url),
        interval_seconds=monitor_data.interval_seconds,
        expected_status=monitor_data.expected_status,
        method=monitor_data.method,
        timeout_seconds=monitor_data.timeout_seconds,
        headers=json.dumps(monitor_data.headers) if monitor_data.headers else None,
        body=monitor_data.body,
        retry_count=monitor_data.retry_count,
        failure_threshold=monitor_data.failure_threshold,
        is_active=monitor_data.is_active,
    )

    db.add(monitor)
    db.commit()
    db.refresh(monitor)

    monitor.headers = (
        json.loads(monitor.headers)
        if monitor.headers
        else None
    )

    return monitor

@router.get("/", response_model=list[MonitorResponse])
def get_monitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitors = (
        db.query(Monitor)
        .filter(Monitor.user_id == current_user.id)
        .all()
    )

    for monitor in monitors:
        monitor.headers = (
            json.loads(monitor.headers)
            if monitor.headers
            else None
        )

    return monitors

@router.get("/{monitor_id}", response_model=MonitorResponse)
def get_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    monitor.headers = (
        json.loads(monitor.headers)
        if monitor.headers
        else None
    )
    
    return monitor

@router.delete("/{monitor_id}", response_model=MonitorDeleteResponse)
def delete_monitor(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

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
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    monitor.name = monitor_data.name
    monitor.url = str(monitor_data.url)
    monitor.interval_seconds = monitor_data.interval_seconds
    monitor.expected_status = monitor_data.expected_status
    monitor.method = monitor_data.method
    monitor.timeout_seconds = monitor_data.timeout_seconds
    monitor.headers = (
        json.dumps(monitor_data.headers)
        if monitor_data.headers
        else None
    )
    monitor.body = monitor_data.body
    monitor.retry_count = monitor_data.retry_count
    monitor.failure_threshold = monitor_data.failure_threshold
    monitor.is_active = monitor_data.is_active

    db.commit()
    db.refresh(monitor)

    monitor.headers = (
        json.loads(monitor.headers)
        if monitor.headers
        else None
    )

    return monitor

@router.patch(
    "/{monitor_id}/status",
    response_model=MonitorStatusResponse,
)
def update_monitor_status(
    monitor_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

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

@router.get(
    "/{monitor_id}/checks",
    response_model=list[CheckResponse],
)
def get_monitor_checks(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    return monitor.checks

@router.get(
    "/{monitor_id}/analytics",
    response_model=MonitorAnalyticsResponse,
)
def get_monitor_analytics(
    monitor_id: int,
    period: str = Query("24h"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    if period == "1h":
        duration = timedelta(hours=1)
    elif period == "24h":
        duration = timedelta(hours=24)
    elif period == "7d":
        duration = timedelta(days=7)
    elif period == "30d":
        duration = timedelta(days=30)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid period. Use 1h, 24h, 7d, or 30d.",
        )

    start_time = datetime.utcnow() - duration

    checks = (
        db.query(Check)
        .filter(
            Check.monitor_id == monitor_id,
            Check.created_at >= start_time,
        )
        .all()
    )

    total_checks = len(checks)

    successful_checks = sum(
        1 for check in checks if check.is_success
    )

    failed_checks = total_checks - successful_checks

    uptime_percentage = (
        (successful_checks / total_checks) * 100
        if total_checks > 0
        else 0.0
    )

    response_times = [
        check.response_time_ms
        for check in checks
        if check.response_time_ms is not None
    ]

    average_response_time_ms = (
        sum(response_times) / len(response_times)
        if response_times
        else None
    )

    min_response_time_ms = (
        min(response_times)
        if response_times
        else None
    )

    max_response_time_ms = (
        max(response_times)
        if response_times
        else None
    )

    return {
        "total_checks": total_checks,
        "successful_checks": successful_checks,
        "failed_checks": failed_checks,
        "uptime_percentage": uptime_percentage,
        "average_response_time_ms": average_response_time_ms,
        "min_response_time_ms": min_response_time_ms,
        "max_response_time_ms": max_response_time_ms,
    }

@router.get(
    "/{monitor_id}/analytics/timeseries",
    response_model=MonitorTimeseriesResponse,
)
def get_monitor_timeseries(
    monitor_id: int,
    period: str = Query("24h"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    if period == "1h":
        duration = timedelta(hours=1)
    elif period == "24h":
        duration = timedelta(hours=24)
    elif period == "7d":
        duration = timedelta(days=7)
    elif period == "30d":
        duration = timedelta(days=30)
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid period. Use 1h, 24h, 7d, or 30d.",
        )

    start_time = datetime.utcnow() - duration

    checks = (
        db.query(Check)
        .filter(
            Check.monitor_id == monitor_id,
            Check.created_at >= start_time,
        )
        .order_by(Check.created_at.asc())
        .all()
    )

    return {
        "period": period,
        "data": [
            {
                "timestamp": check.created_at,
                "response_time_ms": check.response_time_ms,
                "is_success": check.is_success,
            }
            for check in checks
        ],
    }

@router.get(
    "/{monitor_id}/analytics/timeseries/bucketed",
    response_model=MonitorBucketedTimeseriesResponse,
)
def get_bucketed_timeseries(
    monitor_id: int,
    period: str = Query("24h"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    if period == "1h":
        duration = timedelta(hours=1)
        interval_minutes = 1
    elif period == "24h":
        duration = timedelta(hours=24)
        interval_minutes = 5
    elif period == "7d":
        duration = timedelta(days=7)
        interval_minutes = 60
    elif period == "30d":
        duration = timedelta(days=30)
        interval_minutes = 360
    else:
        raise HTTPException(
            status_code=400,
            detail="Invalid period. Use 1h, 24h, 7d, or 30d.",
        )

    start_time = datetime.utcnow() - duration

    checks = (
        db.query(Check)
        .filter(
            Check.monitor_id == monitor_id,
            Check.created_at >= start_time,
        )
        .order_by(Check.created_at.asc())
        .all()
    )

    buckets = {}

    for check in checks:
        elapsed_minutes = int(
            (check.created_at - start_time).total_seconds() // 60
        )

        bucket_index = elapsed_minutes // interval_minutes

        bucket_start = (
            start_time
            + timedelta(
                minutes=bucket_index * interval_minutes
            )
        )

        bucket_key = bucket_start

        if bucket_key not in buckets:
            buckets[bucket_key] = []

        buckets[bucket_key].append(check)

    data = []

    for bucket_start, bucket_checks in buckets.items():
        total_checks = len(bucket_checks)

        successful_checks = sum(
            1
            for check in bucket_checks
            if check.is_success
        )

        response_times = [
            check.response_time_ms
            for check in bucket_checks
            if check.response_time_ms is not None
        ]

        average_response_time_ms = (
            sum(response_times) / len(response_times)
            if response_times
            else None
        )

        uptime_percentage = (
            (successful_checks / total_checks) * 100
            if total_checks > 0
            else 0.0
        )

        data.append(
            {
                "timestamp": bucket_start,
                "average_response_time_ms": average_response_time_ms,
                "uptime_percentage": uptime_percentage,
                "total_checks": total_checks,
            }
        )

    return {
        "period": period,
        "interval_minutes": interval_minutes,
        "data": data,
    }

@router.get("/{monitor_id}/incidents", response_model=IncidentListResponse)
def get_monitor_incidents(
    monitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitor = (
        db.query(Monitor)
        .filter(
            Monitor.id == monitor_id,
            Monitor.user_id == current_user.id,
        )
        .first()
    )

    if not monitor:
        raise HTTPException(
            status_code=404,
            detail="Monitor not found",
        )

    incidents = (
        db.query(Incident)
        .filter(Incident.monitor_id == monitor_id)
        .order_by(Incident.started_at.desc())
        .all()
    )

    return {
        "incidents": incidents
    }