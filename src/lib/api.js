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

export async function updateAlertStatus(alertId, newStatus) {
  try {
    const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Alert update fallback: ${err.message}`);
    return { id: alertId, status: newStatus, message: "Status updated in local session." };
  }
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

export async function getPublicOpenData() {
  return fetchWithFallback("/osint/public-data", () => [
    {
      id: "UNODC-PUB-001",
      title: "International Precursor Chemical Seizure Trend — Western Seaboard",
      substance: "Ephedrine / Precursor Derivatives",
      location: "Port Freeport Corridor",
      event_date: "2026-06-14",
      source: "Synthetic Fallback Data",
      classification: "Synthetic Fallback Data",
      is_real_data: false,
    },
    {
      id: "FDA-PUB-002",
      title: "Regulatory Enforcement Action — Precursor Substance Diversion",
      substance: "Pharmaceutical Chemical Compound",
      location: "Sector 08 Public District",
      event_date: "2026-07-20",
      source: "Synthetic Fallback Data",
      classification: "Synthetic Fallback Data",
      is_real_data: false,
    },
  ]);
}

export async function refreshRealtimeData() {
  return runIngestion();
}

export async function runIngestion() {
  try {
    const res = await fetch(`${API_BASE_URL}/ingestion/run`, { method: "POST" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[API] Ingestion pipeline fallback: ${err.message}`);
    return {
      status: "fallback",
      source: "OpenFDA Drug Enforcement Open API",
      reason: err.message,
      fallback_used: true,
      records_fetched: 15,
      records_inserted: 0,
      duplicates: 15,
      completed_at: new Date().toISOString(),
    };
  }
}

export async function getSystemStatus() {
  return fetchWithFallback("/system/status", () => ({
    status: "online",
    mode: "FALLBACK",
    database: "disconnected",
    ml_engine: "ready",
    neo4j: "sqlite_fallback",
    data_sources: [
      {
        source_id: "openfda_enforcement",
        source_name: "OpenFDA Drug Enforcement Open API",
        source_type: "PUBLIC_DATA",
        status: "FALLBACK",
        last_successful_sync: new Date().toISOString(),
        update_frequency: "Periodic / Lawful Open API",
        record_count: 15,
        data_classification: "Public / Historical Data",
      },
    ],
  }));
}

export async function getDataClassification() {
  return fetchWithFallback("/osint/data-classification", () => ({
    real_public_sources: [
      { name: "OpenFDA Drug Enforcement API", status: "Active / Lawful Public API" },
      { name: "UNODC Public Data Portal", status: "Active / Historical Trends" },
    ],
    data_classification_policy: {
      synthetic_entities: "NARCOSCOPE Fictional Entities (Synthetic / Demonstration)",
      synthetic_relationships: "Fictional Graph Network (Synthetic / Demonstration)",
      ml_indicators: "scikit-learn IsolationForest & TF-IDF (ML Analytics)",
      public_datasets: "UNODC / OpenFDA Public Seizures (Public / Historical Data)",
    },
  }));
}

// ── Investigations ────────────────────────────────────────────────────────
export async function getInvestigations() {
  return fetchWithFallback("/investigations", () => mockData.INVESTIGATIONS);
}

// ── Reports ───────────────────────────────────────────────────────────────
export async function getReports() {
  return fetchWithFallback("/reports", () => mockData.REPORTS);
}
