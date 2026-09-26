from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.auth_dependencies import get_current_user
from app.models import User, Monitor, Check, Incident
from app.schemas import DashboardSummaryResponse

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    monitors = (
        db.query(Monitor)
        .filter(Monitor.user_id == current_user.id)
        .all()
    )

    total_monitors = len(monitors)

    active_monitors = sum(
        1 for monitor in monitors
        if monitor.is_active
    )

    paused_monitors = total_monitors - active_monitors

    up_monitors = 0
    down_monitors = 0

    for monitor in monitors:
        if not monitor.is_active:
            continue

        latest_check = (
            db.query(Check)
            .filter(Check.monitor_id == monitor.id)
            .order_by(Check.created_at.desc())
            .first()
        )

        if latest_check and latest_check.is_success:
            up_monitors += 1
        else:
            down_monitors += 1
        
    active_incidents = (
        db.query(Incident)
        .join(Monitor)
        .filter(
            Monitor.user_id == current_user.id,
            Incident.is_resolved == False,
        )
        .count()
    )

    user_checks = (
        db.query(Check)
        .join(Monitor)
        .filter(Monitor.user_id == current_user.id)
        .all()
    )

    total_checks = len(user_checks)
    successful_checks = sum(
        1 for check in user_checks
        if check.is_success
    )   

    if total_checks > 0:
        overall_uptime_percentage = (
            successful_checks / total_checks
        ) * 100
    else:
        overall_uptime_percentage = 0.0
    
    response_times = [
        check.response_time_ms
        for check in user_checks
        if check.response_time_ms is not None
    ]

    if response_times:
        average_response_time_ms = (
            sum(response_times) / len(response_times)
        )
    else:
        average_response_time_ms = None
    
    return {
        "total_monitors": total_monitors,
        "up_monitors": up_monitors,
        "down_monitors": down_monitors,
        "active_monitors": active_monitors,
        "paused_monitors": paused_monitors,
        "active_incidents": active_incidents,
        "overall_uptime_percentage": overall_uptime_percentage,
        "average_response_time_ms": average_response_time_ms,
    }