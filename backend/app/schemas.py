from datetime import datetime

from pydantic import BaseModel, Field, HttpUrl


class MonitorCreate(BaseModel):
    name: str
    url: HttpUrl
    interval_seconds: int = Field(default=60, ge=10)
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