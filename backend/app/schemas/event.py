"""Pydantic schemas for Event API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.event import EventType, Severity


class EventBase(BaseModel):
    event_type: EventType
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    location_name: Optional[str] = None
    occurred_at: datetime
    severity: Severity = Severity.medium
    metadata_: Optional[dict] = Field(None, alias="metadata")


class EventCreate(EventBase):
    entity_ids: list[str] = Field(default_factory=list)


class EventResponse(EventBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}
