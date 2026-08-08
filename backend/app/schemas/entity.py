"""Pydantic schemas for Entity API request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.entity import EntityType, EntityStatus


# ── Base ────────────────────────────────────────────────────────────────────
class EntityBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    entity_type: EntityType
    description: Optional[str] = None
    risk_score: float = Field(0.0, ge=0, le=100)
    status: EntityStatus = EntityStatus.active
    aliases: list[str] = Field(default_factory=list)
    metadata_: Optional[dict] = Field(None, alias="metadata")
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None


# ── Create ──────────────────────────────────────────────────────────────────
class EntityCreate(EntityBase):
    pass


# ── Update (all fields optional) ────────────────────────────────────────────
class EntityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    entity_type: Optional[EntityType] = None
    description: Optional[str] = None
    risk_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[EntityStatus] = None
    aliases: Optional[list[str]] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None


# ── Response ────────────────────────────────────────────────────────────────
class EntityResponse(EntityBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}


# ── List wrapper ────────────────────────────────────────────────────────────
class EntityListResponse(BaseModel):
    items: list[EntityResponse]
    total: int
