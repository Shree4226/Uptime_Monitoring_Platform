from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class MonitorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    url: HttpUrl = Field(..., max_length=500)
    interval_seconds: int = Field(default=60, ge=10, le=86400)
    expected_status: int = Field(default=200, ge=100, le=599)
    retry_count: int = Field(default=0, ge=0, le=5)
    failure_threshold: int = Field(default=3, ge=1, le=10)
    is_active: bool = True

class MonitorResponse(BaseModel):
    id: int
    name: str
    url: HttpUrl
    interval_seconds: int
    expected_status: int
    retry_count: int
    failure_threshold: int
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

class MonitorAnalyticsResponse(BaseModel):
    total_checks: int
    successful_checks: int
    failed_checks: int
    uptime_percentage: float
    average_response_time_ms: float | None
    min_response_time_ms: int | None
    max_response_time_ms: int | None

class MonitorTimeseriesPoint(BaseModel):
    timestamp: datetime
    response_time_ms: int | None
    is_success: bool


class MonitorTimeseriesResponse(BaseModel):
    period: str
    data: list[MonitorTimeseriesPoint]

class MonitorTimeseriesBucket(BaseModel):
    timestamp: datetime
    average_response_time_ms: float | None
    uptime_percentage: float
    total_checks: int


class MonitorBucketedTimeseriesResponse(BaseModel):
    period: str
    interval_minutes: int
    data: list[MonitorTimeseriesBucket]

class IncidentResponse(BaseModel):
    id: int
    monitor_id: int
    started_at: datetime
    resolved_at: datetime | None
    is_resolved: bool

    model_config = {
        "from_attributes": True
    }


class IncidentListResponse(BaseModel):
    incidents: list[IncidentResponse]