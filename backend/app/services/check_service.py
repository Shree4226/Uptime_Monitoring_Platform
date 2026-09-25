import time
import json

import httpx
from sqlalchemy.orm import Session

from app.models import Check, Monitor


def perform_check(monitor: Monitor):
    attempts = monitor.retry_count + 1
    headers = None

    if monitor.headers:
        headers = json.loads(monitor.headers)

    for attempt in range(attempts):
        start_time = time.perf_counter()

        try:
            response = httpx.request(
                method=monitor.method,
                url=monitor.url,
                headers=headers,
                content=monitor.body,
                timeout=monitor.timeout_seconds,
                follow_redirects=True,
            )

            elapsed_ms = int(
                (time.perf_counter() - start_time) * 1000
            )

            is_success = response.status_code == monitor.expected_status

            return {
                "status_code": response.status_code,
                "response_time_ms": elapsed_ms,
                "is_success": is_success,
            }

        except httpx.RequestError:
            if attempt == attempts - 1:
                return {
                    "status_code": None,
                    "response_time_ms": None,
                    "is_success": False,
                }


def save_check(
    db: Session,
    monitor: Monitor,
    result: dict,
):
    check = Check(
        monitor_id=monitor.id,
        status_code=result["status_code"],
        response_time_ms=result["response_time_ms"],
        is_success=result["is_success"],
    )

    db.add(check)
    db.commit()
    db.refresh(check)

    return check

