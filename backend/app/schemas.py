from pydantic import BaseModel, Field, HttpUrl


class MonitorCreate(BaseModel):
    name: str
    url: HttpUrl
    interval_seconds: int = Field(default=60, ge=10)
    expected_status: int = Field(default=200, ge=100, le=599)