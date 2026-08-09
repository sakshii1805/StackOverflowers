"""
NetworkX In-Memory Graph Analytics Engine.

Loads entities and relationships from the database into a NetworkX DiGraph,
then computes graph-theoretic metrics: centrality, communities, shortest
paths, and risk propagation.
"""

import logging
from typing import Optional

import networkx as nx
from networkx.algorithms.community import greedy_modularity_communities
from sqlalchemy.orm import Session

from app.models.entity import Entity
from app.models.relationship import Relationship

logger = logging.getLogger("narcoscope.graph_engine")


def _build_graph(db: Session) -> nx.DiGraph:
    """
    Build a directed graph from the database.
    Each entity becomes a node with attributes; each relationship becomes an edge.
    """
    G = nx.DiGraph()

    # Load entities as nodes
    entities = db.query(Entity).all()
    for entity in entities:
        G.add_node(
            entity.id,
            label=entity.name,
            entity_type=entity.entity_type.value,
            risk_score=entity.risk_score,
            status=entity.status.value,
        )

    # Load relationships as edges
    relationships = db.query(Relationship).all()
    for rel in relationships:
        # Only add edge if both source and target exist in the graph
        if G.has_node(rel.source_entity_id) and G.has_node(rel.target_entity_id):
            G.add_edge(
                rel.source_entity_id,
                rel.target_entity_id,
                id=rel.id,
                relationship_type=rel.relationship_type.value,
                strength=rel.strength or 0.5,
                evidence=rel.evidence_summary,
            )

    logger.info(
        "Graph built: %d nodes, %d edges", G.number_of_nodes(), G.number_of_edges()
    )
    return G


def compute_centrality(db: Session) -> list[dict]:
    """
    Compute degree, betweenness, and PageRank centrality for each entity.
    Returns a list sorted by PageRank descending.
    """
    G = _build_graph(db)

    if G.number_of_nodes() == 0:
        return []

    # Use undirected view for degree and betweenness
    G_undirected = G.to_undirected()

    degree = nx.degree_centrality(G_undirected)
    betweenness = nx.betweenness_centrality(G_undirected)
    pagerank = nx.pagerank(G, alpha=0.85)

    results = []
    for node_id in G.nodes:
        node_data = G.nodes[node_id]
        results.append({
            "id": node_id,
            "label": node_data.get("label", ""),
            "entity_type": node_data.get("entity_type", ""),
            "risk_score": node_data.get("risk_score", 0),
            "degree_centrality": round(degree.get(node_id, 0), 4),
            "betweenness_centrality": round(betweenness.get(node_id, 0), 4),
            "pagerank": round(pagerank.get(node_id, 0), 4),
        })

    # Sort by PageRank descending
    results.sort(key=lambda x: x["pagerank"], reverse=True)
    return results


def detect_communities(db: Session) -> list[dict]:
    """
    Detect communities using greedy modularity maximization.
    Returns a list of communities, each with member entity details.
    """
    G = _build_graph(db)

    if G.number_of_nodes() == 0:
        return []

    G_undirected = G.to_undirected()
    communities = list(greedy_modularity_communities(G_undirected))

    result = []
    for idx, community_set in enumerate(communities):
        members = []
        total_risk = 0.0
        for node_id in community_set:
            node_data = G.nodes[node_id]
            risk = node_data.get("risk_score", 0)
            total_risk += risk
            members.append({
                "id": node_id,
                "label": node_data.get("label", ""),
                "entity_type": node_data.get("entity_type", ""),
                "risk_score": risk,
            })

        # Sort members within community by risk score descending
        members.sort(key=lambda m: m["risk_score"], reverse=True)

        result.append({
            "community_id": idx + 1,
            "size": len(members),
            "avg_risk": round(total_risk / max(1, len(members)), 2),
            "members": members,
        })

    # Sort communities by avg_risk descending
    result.sort(key=lambda c: c["avg_risk"], reverse=True)
    return result


def find_shortest_path(
    db: Session, source_id: str, target_id: str
) -> Optional[dict]:
    """
    Find the shortest path between two entities in the network.
    Returns the path with entity details and connecting relationships.
    """
    G = _build_graph(db)

    if not G.has_node(source_id) or not G.has_node(target_id):
        return None

    G_undirected = G.to_undirected()

    try:
        path_ids = nx.shortest_path(G_undirected, source_id, target_id)
    except nx.NetworkXNoPath:
        return None

    # Build detailed path
    path_nodes = []
    for node_id in path_ids:
        node_data = G.nodes[node_id]
        path_nodes.append({
            "id": node_id,
            "label": node_data.get("label", ""),
            "entity_type": node_data.get("entity_type", ""),
            "risk_score": node_data.get("risk_score", 0),
        })

    # Find the edges along the path
    path_edges = []
    for i in range(len(path_ids) - 1):
        src, tgt = path_ids[i], path_ids[i + 1]
        # Check both directions since we used undirected for path finding
        if G.has_edge(src, tgt):
            edge_data = G.edges[src, tgt]
        elif G.has_edge(tgt, src):
            edge_data = G.edges[tgt, src]
        else:
            edge_data = {}

        path_edges.append({
            "source": src,
            "target": tgt,
            "relationship_type": edge_data.get("relationship_type", "unknown"),
            "strength": edge_data.get("strength", 0),
        })

    return {
        "source": source_id,
        "target": target_id,
        "length": len(path_ids) - 1,
        "path": path_nodes,
        "edges": path_edges,
    }


def compute_risk_propagation(db: Session) -> list[dict]:
    """
    Propagate risk through the network using a weighted influence model.
    Each entity's propagated risk = own risk + weighted sum of neighbor risks.
    """
    G = _build_graph(db)

    if G.number_of_nodes() == 0:
        return []

    G_undirected = G.to_undirected()

    # Damping factor: how much neighbor risk influences a node
    DAMPING = 0.3

    results = []
    for node_id in G.nodes:
        node_data = G.nodes[node_id]
        own_risk = node_data.get("risk_score", 0)

        # Sum weighted risk from all neighbors
        neighbor_risk_sum = 0.0
        neighbor_count = 0
        for neighbor_id in G_undirected.neighbors(node_id):
            neighbor_data = G.nodes[neighbor_id]
            n_risk = neighbor_data.get("risk_score", 0)

            # Get edge strength as weight
            if G.has_edge(node_id, neighbor_id):
                strength = G.edges[node_id, neighbor_id].get("strength", 0.5)
            elif G.has_edge(neighbor_id, node_id):
                strength = G.edges[neighbor_id, node_id].get("strength", 0.5)
            else:
                strength = 0.5

            neighbor_risk_sum += n_risk * strength
            neighbor_count += 1

        # Propagated risk: own risk + damped average neighbor risk
        if neighbor_count > 0:
            avg_neighbor_risk = neighbor_risk_sum / neighbor_count
            propagated_risk = own_risk + DAMPING * avg_neighbor_risk
        else:
            propagated_risk = own_risk

        # Cap at 100
        propagated_risk = min(100.0, propagated_risk)

        results.append({
            "id": node_id,
            "label": node_data.get("label", ""),
            "entity_type": node_data.get("entity_type", ""),
            "original_risk": own_risk,
            "propagated_risk": round(propagated_risk, 2),
            "risk_delta": round(propagated_risk - own_risk, 2),
            "neighbor_count": neighbor_count,
        })

    # Sort by propagated risk descending
    results.sort(key=lambda x: x["propagated_risk"], reverse=True)
    return results
