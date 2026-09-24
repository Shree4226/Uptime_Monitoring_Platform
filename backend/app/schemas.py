from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class MonitorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    url: HttpUrl = Field(..., max_length=500)
    interval_seconds: int = Field(default=60, ge=10, le=86400)
    expected_status: int = Field(default=200, ge=100, le=599)
    is_active: bool = True

class MonitorResponse(BaseModel):
    id: int
    name: str
    url: HttpUrl
    interval_seconds: int
    expected_status: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }

class MonitorStatusResponse(BaseModel):
    id: int
    is_active: bool
    message: str

class MonitorDeleteResponse(BaseModel):
    id: int
    message: str

class CheckResponse(BaseModel):
    id: int
    monitor_id: int
    status_code: int | None
    response_time_ms: int | None
    is_success: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }