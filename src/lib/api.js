/**
 * NARCOSCOPE API Client
 *
 * Centralized data layer that attempts to fetch from the FastAPI backend
 * (http://localhost:8000/api) first. If the backend is offline or returns an error,
 * it gracefully falls back to mockData.js and logs a warning in the console.
 */

import * as mockData from "./mockData";

const API_BASE_URL = "http://localhost:8000/api";

async function fetchWithFallback(endpoint, mockFallbackFn) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    console.log(`[API] Successfully loaded live backend data for ${endpoint}`);
    // If backend response is wrapper object like { items: [...] }, unpack if needed
    if (data && Array.isArray(data.items)) {
      return data.items;
    }
    return data;
  } catch (err) {
    console.warn(`[API] Backend unavailable for ${endpoint} (${err.message}). Falling back to synthetic mockData.`);
    return mockFallbackFn();
  }
}

// ── Dashboard ─────────────────────────────────────────────────────────────
export async function getDashboardSummary() {
  return fetchWithFallback("/dashboard", () => ({
    stats: {
      total_entities: mockData.DATASET_SUMMARY.totalEntities,
      total_relationships: mockData.DATASET_SUMMARY.totalRelationships,
      total_alerts: mockData.DATASET_SUMMARY.totalAlerts,
      active_investigations: mockData.DATASET_SUMMARY.activeInvestigations,
      total_anomalies: mockData.DATASET_SUMMARY.totalAnomalies,
    },
    sectors: mockData.SECTORS,
    alerts: mockData.ALERTS.slice(0, 5),
    top_entities: [...mockData.ENTITIES].sort((a, b) => b.riskIndicator - a.riskIndicator).slice(0, 5),
  }));
}

// ── Entities ──────────────────────────────────────────────────────────────
export async function getEntities() {
  return fetchWithFallback("/entities", () => mockData.ENTITIES);
}

export async function getEntityById(id) {
  return fetchWithFallback(`/entities/${id}`, () => mockData.getEntityById(id));
}

// ── Network Intelligence ──────────────────────────────────────────────────
export async function getNetworkGraph() {
  return fetchWithFallback("/network/graph", () => ({
    nodes: mockData.ENTITIES,
    links: mockData.RELATIONSHIPS,
  }));
}

// ── Activity Map / Sectors ────────────────────────────────────────────────
export async function getSectors() {
  return fetchWithFallback("/map/sectors", () => mockData.SECTORS);
}

// ── Alerts ────────────────────────────────────────────────────────────────
export async function getAlerts() {
  return fetchWithFallback("/alerts", () => mockData.ALERTS);
}

// ── Anomalies ─────────────────────────────────────────────────────────────
export async function getAnomalies() {
  return fetchWithFallback("/anomalies", () => mockData.ANOMALIES);
}

// ── OSINT Intelligence ────────────────────────────────────────────────────
export async function getOsintFeeds() {
  return fetchWithFallback("/osint/feeds", () => mockData.OSINT_FEEDS);
}

export async function submitTipOff(content, informantAlias = "Anonymous-Informant") {
  try {
    const res = await fetch(`${API_BASE_URL}/osint/tip-off`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ informant_alias: informantAlias, content }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Tip-off submission offline fallback: ${err.message}`);
    return {
      status: "received",
      informant_alias: informantAlias,
      nlp_analysis: {
        extracted_entities: [
          { name: "Person 102", entity_type: "person", confidence: 0.85 },
          { name: "Vehicle SYN-4821", entity_type: "vehicle", confidence: 0.9 },
        ],
        keywords: ["informant", "vehicle", "depot", "cash"],
        risk_score: 85,
        risk_level: "high",
        summary: "Extracted 2 entity lead(s) with high risk score.",
      },
      action_taken: "Investigative lead automatically generated in central graph engine.",
    };
  }
}

export async function predictRouteRisk(originSector, destinationSector) {
  try {
    const res = await fetch(`${API_BASE_URL}/osint/predict-route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin_sector: originSector, destination_sector: destinationSector }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      origin: originSector,
      destination: destinationSector,
      predicted_risk_score: 72,
      route_trafficking_likelihood: "High",
      recommended_action: "Increase surveillance and deploy mobile checkpoints",
    };
  }
}

// ── Investigations ────────────────────────────────────────────────────────
export async function getInvestigations() {
  return fetchWithFallback("/investigations", () => mockData.INVESTIGATIONS);
}

// ── Reports ───────────────────────────────────────────────────────────────
export async function getReports() {
  return fetchWithFallback("/reports", () => mockData.REPORTS);
}
