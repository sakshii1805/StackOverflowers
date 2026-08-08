"""
Relationship model — edges in the NARCOSCOPE entity graph.

Represents a directed link between two Entities with a type,
strength score, and evidence summary.
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
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class RelationshipType(str, enum.Enum):
    associate = "associate"
    family = "family"
    financial = "financial"
    communication = "communication"
    logistics = "logistics"
    command = "command"


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_entity_id = Column(
        String(36), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    target_entity_id = Column(
        String(36), ForeignKey("entities.id", ondelete="CASCADE"), nullable=False
    )
    relationship_type = Column(Enum(RelationshipType), nullable=False)
    strength = Column(Float, nullable=False, default=0.5)  # 0.0–1.0
    evidence_summary = Column(Text, nullable=True)
    first_observed = Column(DateTime, nullable=True)
    last_observed = Column(DateTime, nullable=True)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # ── Back-references ─────────────────────────────────────────────────
    source_entity = relationship(
        "Entity",
        foreign_keys=[source_entity_id],
        back_populates="relationships_as_source",
    )
    target_entity = relationship(
        "Entity",
        foreign_keys=[target_entity_id],
        back_populates="relationships_as_target",
    )

    __table_args__ = (
        Index("ix_relationships_source", "source_entity_id"),
        Index("ix_relationships_target", "target_entity_id"),
        Index("ix_relationships_type", "relationship_type"),
    )

    def __repr__(self):
        return (
            f"<Relationship {self.source_entity_id[:8]}→{self.target_entity_id[:8]} "
            f"({self.relationship_type.value})>"
        )
