"""
Entities API Endpoints
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.models.entity import Entity

router = APIRouter(prefix="/entities", tags=["Entities"])


@router.get("")
def read_entities(
    skip: int = 0,
    limit: int = 100,
    entity_type: str | None = None,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Retrieve entities with optional type filters."""
    query = db.query(Entity)
    if entity_type:
        query = query.filter(Entity.entity_type == entity_type)

    entities = query.offset(skip).limit(limit).all()

    return [
        {
            "id": str(e.id),
            "rawId": str(e.id),
            "label": e.name,
            "type": e.entity_type.value if hasattr(e.entity_type, "value") else str(e.entity_type),
            "riskIndicator": int(e.risk_score),
            "sectorId": (
                str(getattr(e, "sector_id", None) or getattr(e, "sectorId", None))
                if (getattr(e, "sector_id", None) or getattr(e, "sectorId", None)) is not None
                else None
            ),
            "connections": len(e.relationships_as_source) + len(e.relationships_as_target),
            "events": [ev.title for ev in e.events] if e.events else [],
            "createdAt": e.created_at.isoformat() if e.created_at else None,
        }
        for e in entities
    ]


@router.get("/{entity_id}")
def read_entity(
    entity_id: str,
    db: Session = Depends(deps.get_db),
) -> Any:
    """Get entity details by ID."""
    entity = db.query(Entity).filter(Entity.id == entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return {
        "id": str(entity.id),
        "rawId": str(entity.id),
        "label": entity.name,
        "type": entity.entity_type.value if hasattr(entity.entity_type, "value") else str(entity.entity_type),
        "riskIndicator": int(entity.risk_score),
        "sectorId": (
            str(getattr(entity, "sector_id", None) or getattr(entity, "sectorId", None))
            if (getattr(entity, "sector_id", None) or getattr(entity, "sectorId", None)) is not None
            else None
        ),
        "connections": len(entity.relationships_as_source) + len(entity.relationships_as_target),
        "events": [ev.title for ev in entity.events] if entity.events else [],
        "createdAt": entity.created_at.isoformat() if entity.created_at else None,
    }
