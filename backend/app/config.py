from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./ashvamedha.db"

    secret_key: str = "dev-only-insecure-secret-change-me"
    token_expire_hours: int = 12

    admin_username: str = "admin"
    admin_password: str = "admin123"

    cors_origins: str = "http://localhost:3000"
    public_base_url: str = "http://localhost:8000"

    upi_id: str = ""
    upi_payee_name: str = "ASHVAMEDHA IIT Bhubaneswar"

    auto_seed: bool = True
    points_win: int = 3
    points_draw: int = 1
    points_loss: int = 0

    media_dir: str = "media"
    max_upload_mb: int = 5

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        url = self.database_url
        # Render / Heroku style URLs -> SQLAlchemy + psycopg3 driver
        if url.startswith("postgres://"):
            url = "postgresql+psycopg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://"):]
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
