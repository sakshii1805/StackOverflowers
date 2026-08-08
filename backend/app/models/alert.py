"""
Alert model — system-generated intelligence alerts.

Alerts are produced by anomaly detection, threshold breaches, pattern
recognition, or risk score changes. They can optionally link to an
Entity and/or Event.
"""

import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    Boolean,
    DateTime,
    Enum,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.event import Severity


class AlertType(str, enum.Enum):
    anomaly = "anomaly"
    threshold = "threshold"
    pattern = "pattern"
    new_entity = "new_entity"
    risk_change = "risk_change"


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    alert_type = Column(Enum(AlertType), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(Enum(Severity), nullable=False, default=Severity.medium)
    is_read = Column(Boolean, nullable=False, default=False)
    entity_id = Column(
        String(36), ForeignKey("entities.id", ondelete="SET NULL"), nullable=True
    )
    event_id = Column(
        String(36), ForeignKey("events.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    acknowledged_at = Column(DateTime, nullable=True)

    # ── Relationships ───────────────────────────────────────────────────
    entity = relationship("Entity", back_populates="alerts")
    event = relationship("Event", back_populates="alerts")

    __table_args__ = (
        Index("ix_alerts_is_read", "is_read"),
        Index("ix_alerts_severity", "severity"),
        Index("ix_alerts_created", "created_at"),
    )

    def __repr__(self):
        return f"<Alert {self.title!r} ({self.alert_type.value}, {self.severity.value})>"
