"""
Entity model — the core intelligence unit in NARCOSCOPE.

An Entity can be a person, organization, vehicle, phone number,
location, or financial account involved in narcotics intelligence.
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
    JSON,
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class EntityType(str, enum.Enum):
    person = "person"
    organization = "organization"
    vehicle = "vehicle"
    phone = "phone"
    location = "location"
    financial_account = "financial_account"


class EntityStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    under_investigation = "under_investigation"
    cleared = "cleared"


class Entity(Base):
    __tablename__ = "entities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False, index=True)
    entity_type = Column(Enum(EntityType), nullable=False, index=True)
    description = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=False, default=0.0)  # 0–100
    status = Column(
        Enum(EntityStatus), nullable=False, default=EntityStatus.active
    )
    aliases = Column(JSON, nullable=True, default=list)  # ["alias1", "alias2"]
    metadata_ = Column("metadata", JSON, nullable=True, default=dict)
    first_seen = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Relationships ───────────────────────────────────────────────────
    relationships_as_source = relationship(
        "Relationship",
        foreign_keys="Relationship.source_entity_id",
        back_populates="source_entity",
        cascade="all, delete-orphan",
    )
    relationships_as_target = relationship(
        "Relationship",
        foreign_keys="Relationship.target_entity_id",
        back_populates="target_entity",
        cascade="all, delete-orphan",
    )
    alerts = relationship("Alert", back_populates="entity", cascade="all, delete-orphan")
    events = relationship(
        "Event", secondary="event_entity", back_populates="entities"
    )

    __table_args__ = (
        Index("ix_entities_risk_score", "risk_score"),
        Index("ix_entities_type_status", "entity_type", "status"),
    )

    def __repr__(self):
        return f"<Entity {self.name!r} ({self.entity_type.value})>"
