from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Uptime Monitoring Platform"
    debug: bool = False
    database_url: str
    redis_broker_url: str
    redis_backend_url: str

    secret_key: str
    algorithm: str = "HS256"

    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env")

    @field_validator("database_url", mode="after")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return value.replace(
                "postgres://",
                "postgresql+psycopg://",
                1,
            )

        if value.startswith("postgresql://"):
            return value.replace(
                "postgresql://",
                "postgresql+psycopg://",
                1,
            )

        return value


settings = Settings()