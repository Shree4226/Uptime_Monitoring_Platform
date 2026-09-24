from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Uptime Monitoring Platform"
    debug: bool = True

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()