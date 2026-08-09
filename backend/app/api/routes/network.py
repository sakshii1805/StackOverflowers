"""
Network Graph API Endpoints
"""

from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.entity import Entity
from app.models.relationship import Relationship

router = APIRouter(prefix="/network", tags=["Network"])


from app.services.graph_service import get_graph_network_topology


@router.get("/graph")
def read_network_graph(
    db: Session = Depends(deps.get_db),
) -> Any:
    """Retrieve graph nodes and relationships formatted for ForceGraph2D."""
    topo = get_graph_network_topology(db)

    # Format nodes & links matching React ForceGraph2D expectations
    nodes = [
        {
            "id": n["id"],
            "label": n["name"],
            "name": n["name"],
            "type": n["type"],
            "sectorId": n["sector"],
            "connections": 3,
            "riskIndicator": int(n["risk_score"]),
            "centrality": n.get("centrality", 0.05),
        }
        for n in topo["nodes"]
    ]

    links = [
        {
            "id": l["id"],
            "source": l["source"],
            "target": l["target"],
            "type": l["type"],
            "label": l["type"],
            "weight": l["strength"],
        }
        for l in topo["links"]
    ]

    return {"nodes": nodes, "links": links, "summary": topo["summary"]}
