from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NARCOSCOPE Backend"
    VERSION: str = "0.1.0"

    # Application Mode
    DEMO_MODE: bool = True

    # Databases
    DATABASE_URL: str = "postgresql://narcoscope_user:narcoscope_pass@localhost:5432/narcoscope_db"
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = "narcoscope_secret_password"

    # SQLite (used when DEMO_MODE=True)
    SQLITE_URL: str = ""  # auto-resolved at runtime if empty

    # Auto-seed demo data on startup when DEMO_MODE=True and DB is empty
    AUTO_SEED: bool = True

    # Auth & Security
    JWT_SECRET: str = "default_dev_secret_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
