"""
Report model — generated intelligence reports.

Reports can be standalone (e.g., daily briefs) or linked to a
specific Investigation.
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
    Index,
)
from sqlalchemy.orm import relationship

from app.db.base import Base


class ReportType(str, enum.Enum):
    daily_brief = "daily_brief"
    entity_profile = "entity_profile"
    network_analysis = "network_analysis"
    investigation_summary = "investigation_summary"


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    report_type = Column(Enum(ReportType), nullable=False, index=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    investigation_id = Column(
        String(36),
        ForeignKey("investigations.id", ondelete="SET NULL"),
        nullable=True,
    )
    generated_by = Column(String(128), nullable=True, default="NARCOSCOPE AI")
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # ── Relationships ───────────────────────────────────────────────────
    investigation = relationship("Investigation", back_populates="reports")

    __table_args__ = (
        Index("ix_reports_created", "created_at"),
    )

    def __repr__(self):
        return f"<Report {self.title!r} ({self.report_type.value})>"
