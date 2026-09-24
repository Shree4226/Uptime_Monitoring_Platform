from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Uptime Monitoring Platform"
    debug: bool = True


settings = Settings()