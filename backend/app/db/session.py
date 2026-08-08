"""
SQLAlchemy engine and session factory for NARCOSCOPE.

- DEMO_MODE=True  → uses SQLite file at backend/narcoscope.db (zero install)
- DEMO_MODE=False → uses DATABASE_URL from config (PostgreSQL in production)
"""

from pathlib import Path
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# ── Resolve database URL ────────────────────────────────────────────────────
if settings.DEMO_MODE:
    _db_path = Path(__file__).resolve().parent.parent.parent / "narcoscope.db"
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{_db_path}"
else:
    SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# ── Create engine ───────────────────────────────────────────────────────────
_is_sqlite = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # SQLite needs check_same_thread=False for FastAPI's threaded request model
    connect_args={"check_same_thread": False} if _is_sqlite else {},
    echo=False,
)

# Enable SQLite foreign key enforcement (off by default in SQLite)
if _is_sqlite:
    @event.listens_for(engine, "connect")
    def _set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

# ── Session factory ─────────────────────────────────────────────────────────
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency that yields a database session per request."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
