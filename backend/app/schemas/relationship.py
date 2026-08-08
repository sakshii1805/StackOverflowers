"""Pydantic schemas for Relationship API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.relationship import RelationshipType


class RelationshipBase(BaseModel):
    source_entity_id: str
    target_entity_id: str
    relationship_type: RelationshipType
    strength: float = Field(0.5, ge=0.0, le=1.0)
    evidence_summary: Optional[str] = None
    first_observed: Optional[datetime] = None
    last_observed: Optional[datetime] = None


class RelationshipCreate(RelationshipBase):
    pass


class RelationshipResponse(RelationshipBase):
    id: str
    created_at: datetime

    model_config = {"from_attributes": True}
