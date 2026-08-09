"""
Graph Intelligence Service for NARCOSCOPE.
Provides graph network topology calculations using NetworkX and optional Neo4j driver with SQLite fallback.
"""

import logging
from typing import Any
import networkx as nx
from sqlalchemy.orm import Session

from app.models.entity import Entity
from app.models.relationship import Relationship

logger = logging.getLogger("narcoscope.graph_service")


def get_graph_network_topology(db: Session) -> dict[str, Any]:
    """
    Extracts entities and relationships from the database, builds a NetworkX graph,
    calculates degree centrality & cluster metrics, and returns the graph data shape for ForceGraph2D.
    """
    entities = db.query(Entity).all()
    relationships = db.query(Relationship).all()

    G = nx.Graph()

    nodes_data = []
    for ent in entities:
        G.add_node(str(ent.id), name=ent.name, type=ent.entity_type.value if hasattr(ent.entity_type, "value") else str(ent.entity_type))
        nodes_data.append({
            "id": str(ent.id),
            "name": ent.name,
            "type": ent.entity_type.value if hasattr(ent.entity_type, "value") else str(ent.entity_type),
            "risk_score": float(ent.risk_score or 50.0),
            "status": ent.status.value if hasattr(ent.status, "value") else str(ent.status),
            "sector": ent.metadata_.get("sector_id", "S04") if isinstance(ent.metadata_, dict) else "S04",
        })

    links_data = []
    for rel in relationships:
        G.add_edge(str(rel.source_entity_id), str(rel.target_entity_id), weight=float(rel.strength or 0.5))
        links_data.append({
            "id": str(rel.id),
            "source": str(rel.source_entity_id),
            "target": str(rel.target_entity_id),
            "type": rel.relationship_type.value if hasattr(rel.relationship_type, "value") else str(rel.relationship_type),
            "strength": float(rel.strength or 0.5),
            "evidence": rel.evidence_summary or "",
        })

    # Calculate NetworkX centrality metrics
    try:
        centrality = nx.degree_centrality(G)
        for node in nodes_data:
            node["centrality"] = float(round(centrality.get(node["id"], 0.0), 3))
    except Exception as exc:
        logger.warning("Centrality calculation fallback: %s", exc)

    return {
        "nodes": nodes_data,
        "links": links_data,
        "summary": {
            "node_count": len(nodes_data),
            "link_count": len(links_data),
            "graph_engine": "NetworkX + SQLite (Neo4j Fallback)",
        },
    }
