import re
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = ""
    mongodb_db_name: str = "ashvamedha2026"

    secret_key: str = "dev-only-insecure-secret-change-me"
    token_expire_hours: int = 12

    admin_username: str = "admin"
    admin_password: str = "admin123"
    # sport:username:password entries separated by semicolons or newlines.
    sport_admins: str = ""

    cors_origins: str = "http://localhost:3000"
    public_base_url: str = "http://localhost:8000"

    upi_id: str = ""
    upi_payee_name: str = "ASHVAMEDHA IIT Bhubaneswar"

    auto_seed: bool = True
    # Public registration is deliberately closed by default. Set REGISTRATIONS_OPEN=true to reopen.
    registrations_open: bool = False
    seed_demo_matches: bool = False
    points_win: int = 3
    points_draw: int = 1
    points_loss: int = 0

    media_dir: str = "media"
    max_upload_mb: int = 5

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sport_admin_list(self) -> list[tuple[str, str, str]]:
        out: list[tuple[str, str, str]] = []
        for entry in re.split(r"[;\n]", self.sport_admins):
            parts = [part.strip() for part in entry.split(":", 2)]
            if len(parts) == 3 and all(parts):
                out.append((parts[0], parts[1], parts[2]))
        return out


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
