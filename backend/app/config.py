from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Uptime Monitoring Platform"
    debug: bool = True
    database_url: str
    redis_broker_url: str
    redis_backend_url: str

    secret_key: str
    algorithm: str = "HS256"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()