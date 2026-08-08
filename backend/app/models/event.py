"""
Event model — intelligence events in NARCOSCOPE.

Events are time-stamped, geo-located occurrences such as seizures,
sightings, transactions, or communications. They link to Entities
via a many-to-many association table.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    Float,
    DateTime,
    Enum,
    ForeignKey,
    JSON,
    Table,
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


# ── M2M association: events ↔ entities ──────────────────────────────────────
event_entity_table = Table(
    "event_entity",
    Base.metadata,
    Column(
        "event_id",
        String(36),
        ForeignKey("events.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "entity_id",
        String(36),
        ForeignKey("entities.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class EventType(str, enum.Enum):
    seizure = "seizure"
    sighting = "sighting"
    transaction = "transaction"
    communication = "communication"
    border_crossing = "border_crossing"
    meeting = "meeting"
    tip = "tip"
    arrest = "arrest"


class Severity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_type = Column(Enum(EventType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    occurred_at = Column(DateTime, nullable=False)
    severity = Column(Enum(Severity), nullable=False, default=Severity.medium)
    metadata_ = Column("metadata", JSON, nullable=True, default=dict)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ───────────────────────────────────────────────────
    entities = relationship(
        "Entity", secondary=event_entity_table, back_populates="events"
    )
    alerts = relationship("Alert", back_populates="event")

    __table_args__ = (
        Index("ix_events_occurred", "occurred_at"),
        Index("ix_events_severity", "severity"),
        Index("ix_events_location", "latitude", "longitude"),
    )

    def __repr__(self):
        return f"<Event {self.title!r} ({self.event_type.value})>"
