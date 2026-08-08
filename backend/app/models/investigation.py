"""
Investigation & InvestigationNote models.

An Investigation is an analyst-created case that groups entities,
events, and notes into a coherent intelligence inquiry.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    DateTime,
    Enum,
    ForeignKey,
    Table,
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


# ── M2M association: investigations ↔ entities ──────────────────────────────
investigation_entity_table = Table(
    "investigation_entity",
    Base.metadata,
    Column(
        "investigation_id",
        String(36),
        ForeignKey("investigations.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "entity_id",
        String(36),
        ForeignKey("entities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class InvestigationStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    closed = "closed"
    archived = "archived"


class Priority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(
        Enum(InvestigationStatus),
        nullable=False,
        default=InvestigationStatus.open,
    )
    priority = Column(Enum(Priority), nullable=False, default=Priority.medium)
    lead_analyst = Column(String(128), nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    closed_at = Column(DateTime, nullable=True)

    # ── Relationships ───────────────────────────────────────────────────
    entities = relationship(
        "Entity", secondary=investigation_entity_table, backref="investigations"
    )
    notes = relationship(
        "InvestigationNote",
        back_populates="investigation",
        cascade="all, delete-orphan",
        order_by="InvestigationNote.created_at",
    )
    reports = relationship("Report", back_populates="investigation")

    __table_args__ = (
        Index("ix_investigations_status", "status"),
        Index("ix_investigations_priority", "priority"),
    )

    def __repr__(self):
        return f"<Investigation {self.title!r} ({self.status.value})>"


class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    investigation_id = Column(
        String(36),
        ForeignKey("investigations.id", ondelete="CASCADE"),
        nullable=False,
    )
    content = Column(Text, nullable=False)
    author = Column(String(128), nullable=True, default="System")
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # ── Back-reference ──────────────────────────────────────────────────
    investigation = relationship("Investigation", back_populates="notes")

    def __repr__(self):
        return f"<InvestigationNote by {self.author!r} on {self.created_at}>"
