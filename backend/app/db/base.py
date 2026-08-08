"""
Declarative base for all SQLAlchemy ORM models.

Import this module wherever you need the shared `Base` class.
All model files are imported here so Alembic can auto-discover them.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for every NARCOSCOPE ORM model."""
    pass


# ── Import every model so Alembic's autogenerate sees them ──────────────────
# These imports must happen AFTER Base is defined to avoid circular imports.
from app.models.entity import Entity  # noqa: E402, F401
from app.models.relationship import Relationship  # noqa: E402, F401
from app.models.event import Event, event_entity_table  # noqa: E402, F401
from app.models.alert import Alert  # noqa: E402, F401
from app.models.investigation import (  # noqa: E402, F401
    Investigation,
    InvestigationNote,
    investigation_entity_table,
)
from app.models.report import Report  # noqa: E402, F401
