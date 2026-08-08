"""Pydantic schemas for Alert API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.alert import AlertType
from app.models.event import Severity


class AlertBase(BaseModel):
    alert_type: AlertType
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    severity: Severity = Severity.medium
    entity_id: Optional[str] = None
    event_id: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertResponse(AlertBase):
    id: str
    is_read: bool
    created_at: datetime
    acknowledged_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
