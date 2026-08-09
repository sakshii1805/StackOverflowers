// ============================================================
// SYNTHETIC / DEMO DATA ONLY.
// Nothing in this file represents a real person, vehicle, location,
// or event. It exists to demonstrate NARCOSCOPE's UI end-to-end
// without requiring a live backend, per the "DEMO MODE" requirement.
//
// Every page should read from the exported collections/selectors
// below rather than generating its own data, so an entity clicked
// in the Network graph is the same entity shown in Entities, Alerts,
// and Investigations.
// ============================================================

/* ---------- deterministic seeded RNG (mulberry32) ----------
   Using a fixed seed keeps the dataset identical across reloads,
   so a demo doesn't change shape mid-presentation. */

function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260101);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

/* ---------- sectors ---------- */

const SECTOR_NAMES = [
  "Riverside",
  "Harborview",
  "Midtown",
  "Depot Row",
  "Eastgate",
  "Old Mill",
  "Southline",
  "Freeport",
  "Northfield",
  "Union Yards",
  "Lakeside",
  "Ashcroft",
];

export const SECTORS = SECTOR_NAMES.map((name, i) => {
  const baseline = randInt(6, 15);
  // Sectors 04 and 08 (index 3, 7) get an engineered spike so the
  // Anomaly Detection and Alert Center pages have a clear story.
  const spike = i === 3 ? 2.6 : i === 7 ? 1.7 : 1 + rand() * 0.35;
  const trend = Array.from({ length: 6 }, (_, m) => {
    const progress = m / 5;
    return Math.round(baseline * (1 + (spike - 1) * progress ** 2 + (rand() - 0.5) * 0.15));
  });
  const activityCount = trend[trend.length - 1];
  const anomalyScore = Math.min(1, Math.max(0, (activityCount / baseline - 1) / 1.6));
  return {
    id: `S${String(i + 1).padStart(2, "0")}`,
    name: `Sector ${String(i + 1).padStart(2, "0")} — ${name}`,
    baseline,
    trend,
    activityCount,
    anomalyScore: Number(anomalyScore.toFixed(2)),
  };
});

/* ---------- entities ---------- */

const TYPE_WEIGHTS = [
  { type: "person", weight: 5 },
  { type: "vehicle", weight: 3 },
  { type: "location", weight: 2 },
  { type: "shipment", weight: 3 },
  { type: "organization", weight: 1 },
];
const WEIGHTED_TYPES = TYPE_WEIGHTS.flatMap((t) => Array(t.weight).fill(t.type));

const ENTITY_COUNT = 140;

function labelFor(type, seq) {
  switch (type) {
    case "person":
      return `Person ${100 + seq}`;
    case "vehicle":
      return `Vehicle ${pick(["VX", "TK", "QR", "LM", "BR", "HN"])}-${randInt(100, 399)}`;
    case "location":
      return `${pick(["Depot", "Wharf", "Lot", "Yard", "Warehouse", "Terminal"])} ${pick(["A", "B", "C", "9", "12", "3"])}`;
    case "shipment":
      return `Shipment ${8000 + seq}`;
    case "organization":
      return `Org ${pick(["Meridian", "Coastal", "Vantage", "Ironbridge", "Halcyon"])} ${pick(["Holdings", "Logistics", "Group", "Trading"])}`;
    default:
      return `Entity ${seq}`;
  }
}

function idFor(type, seq) {
  const prefix = { person: "P", vehicle: "V", location: "L", shipment: "SH", organization: "O" }[type];
  return `${prefix}-${1000 + seq}`;
}

export const ENTITIES = Array.from({ length: ENTITY_COUNT }, (_, i) => {
  const type = WEIGHTED_TYPES[i % WEIGHTED_TYPES.length];
  const sector = pick(SECTORS);
  return {
    id: idFor(type, i),
    type,
    label: labelFor(type, i),
    sectorId: sector.id,
    riskIndicator: randInt(8, 96),
    connections: 0, // filled in below once relationships exist
    locations: randInt(1, 4),
    events: randInt(0, 9),
    createdAt: `2026-0${randInt(2, 7)}-${String(randInt(1, 28)).padStart(2, "0")}`,
  };
});

/* ---------- relationships ----------
   Build a few dense, obviously-suspicious clusters (per the brief's
   "make the graph look impressive" note) plus scattered background
   edges so the graph isn't uniformly connected. */

const REL_LABELS = {
  CONNECTED_TO: "connected to",
  ASSOCIATED_WITH: "associated with",
  VISITED: "visited",
  USED: "used",
  LINKED_TO: "linked to",
  INVOLVED_IN: "involved in",
};

function relTypeFor(a, b) {
  if (a === "person" && b === "vehicle") return "USED";
  if (a === "vehicle" && b === "location") return "VISITED";
  if (a === "location" && b === "shipment") return "LINKED_TO";
  if (a === "person" && b === "person") return "ASSOCIATED_WITH";
  if (a === "person" && b === "organization") return "INVOLVED_IN";
  return "CONNECTED_TO";
}

let relSeq = 0;
function makeEdge(a, b) {
  relSeq += 1;
  const type = relTypeFor(a.type, b.type);
  return {
    id: `REL-${relSeq}`,
    source: a.id,
    target: b.id,
    type,
    label: REL_LABELS[type],
  };
}

const relationships = [];
const bySector = (sectorId) => ENTITIES.filter((e) => e.sectorId === sectorId);

// Dense clusters within each sector — this is what makes Sector 04's
// "repeated vehicle association" story visible in the Network graph.
for (const sector of SECTORS) {
  const members = bySector(sector.id);
  const clusterSize = Math.min(members.length, sector.id === "S04" ? 14 : randInt(6, 10));
  const cluster = members.slice(0, clusterSize);
  for (let i = 0; i < cluster.length - 1; i++) {
    relationships.push(makeEdge(cluster[i], cluster[i + 1]));
    if (rand() > 0.55 && i + 2 < cluster.length) {
      relationships.push(makeEdge(cluster[i], cluster[i + 2]));
    }
  }
}

// Sparse cross-sector edges so the graph isn't a set of disconnected islands.
for (let i = 0; i < 40; i++) {
  const a = pick(ENTITIES);
  const b = pick(ENTITIES);
  if (a.id !== b.id) relationships.push(makeEdge(a, b));
}

export const RELATIONSHIPS = relationships;

// Backfill connection counts now that relationships exist.
const connectionCounts = new Map();
for (const r of RELATIONSHIPS) {
  connectionCounts.set(r.source, (connectionCounts.get(r.source) ?? 0) + 1);
  connectionCounts.set(r.target, (connectionCounts.get(r.target) ?? 0) + 1);
}
for (const e of ENTITIES) {
  e.connections = connectionCounts.get(e.id) ?? 0;
}

/* ---------- anomalies (derived from sector trends) ---------- */

function severityFor(deviationPct) {
  if (deviationPct >= 120) return "critical";
  if (deviationPct >= 60) return "high";
  if (deviationPct >= 25) return "medium";
  return "low";
}

export const ANOMALIES = SECTORS.filter((s) => s.activityCount / s.baseline >= 1.2)
  .map((s, i) => {
    const deviationPct = Math.round(((s.activityCount - s.baseline) / s.baseline) * 100);
    return {
      id: `ANM-${i + 1}`,
      sectorId: s.id,
      label:
        deviationPct >= 100
          ? "Sharp activity spike"
          : deviationPct >= 50
          ? "Sustained activity increase"
          : "Minor activity deviation",
      baseline: s.baseline,
      observed: s.activityCount,
      deviationPct,
      anomalyScore: s.anomalyScore,
      severity: severityFor(deviationPct),
    };
  })
  .sort((a, b) => b.deviationPct - a.deviationPct);

/* ---------- alerts ---------- */

const ALERT_REASONS = [
  "Repeated vehicle association detected across independent records",
  "Unusual shipment frequency identified",
  "Entity connection anomaly flagged by network analysis",
  "New location pattern detected near existing cluster",
  "Activity spike exceeds historical baseline",
];

export const ALERTS = ANOMALIES.map((a, i) => {
  const sectorEntities = bySector(a.sectorId);
  const related = sectorEntities.slice(0, Math.min(3, sectorEntities.length)).map((e) => e.id);
  return {
    id: `ALT-${i + 1}`,
    title: a.label,
    severity: a.severity,
    status: i === 0 ? "investigating" : i < 3 ? "new" : "resolved",
    sectorId: a.sectorId,
    relatedEntities: related,
    reason: pick(ALERT_REASONS),
    timestamp: `2026-07-${String(randInt(1, 28)).padStart(2, "0")}T${String(randInt(6, 22)).padStart(2, "0")}:${String(
      randInt(0, 59)
    ).padStart(2, "0")}:00Z`,
  };
});

/* ---------- investigations ---------- */

export const INVESTIGATIONS = [
  {
    id: "INV-01",
    title: "Depot Row activity cluster",
    description: "Reviewing a dense entity cluster and repeated vehicle association in Sector 04.",
    status: "active",
    priority: "high",
    createdAt: "2026-06-18",
    entityIds: bySector("S04").slice(0, 6).map((e) => e.id),
    alertIds: ALERTS.filter((a) => a.sectorId === "S04").map((a) => a.id),
  },
  {
    id: "INV-02",
    title: "Freeport shipment pattern review",
    description: "Assessing an unusual shipment frequency pattern flagged by anomaly detection.",
    status: "open",
    priority: "medium",
    createdAt: "2026-07-02",
    entityIds: bySector("S08").slice(0, 4).map((e) => e.id),
    alertIds: ALERTS.filter((a) => a.sectorId === "S08").map((a) => a.id),
  },
  {
    id: "INV-03",
    title: "Harborview baseline check",
    description: "Routine review of a minor activity deviation; no significant findings so far.",
    status: "closed",
    priority: "low",
    createdAt: "2026-05-27",
    entityIds: bySector("S02").slice(0, 3).map((e) => e.id),
    alertIds: ALERTS.filter((a) => a.sectorId === "S02").map((a) => a.id),
  },
];

export const INVESTIGATION_TIMELINES = {
  "INV-01": [
    { time: "08:30", description: "Event detected — activity spike logged in Sector 04" },
    { time: "09:15", description: "Entity associated — Vehicle linked to two prior records" },
    { time: "10:40", description: "Location activity increased near Depot 9" },
    { time: "12:20", description: "Anomaly detected — deviation exceeded threshold" },
  ],
  "INV-02": [
    { time: "07:05", description: "Shipment frequency flagged above baseline" },
    { time: "11:50", description: "Cross-referenced with prior Sector 08 records" },
  ],
  "INV-03": [{ time: "14:10", description: "Routine baseline check opened" }],
};

/* ---------- OSINT ---------- */

const OSINT_SOURCE_TYPES = [
  { name: "Public Social Post", credibility: 55 },
  { name: "News Aggregator", credibility: 82 },
  { name: "Public Records Index", credibility: 91 },
  { name: "Forum / Message Board", credibility: 38 },
  { name: "Marketplace Listing Archive", credibility: 64 },
  { name: "Satellite Imagery Provider", credibility: 88 },
];

export const OSINT_SOURCES = OSINT_SOURCE_TYPES.map((s, i) => ({
  id: `SRC-${i + 1}`,
  name: s.name,
  credibility: s.credibility,
  recordsIndexed: randInt(120, 4200),
}));

const OSINT_SNIPPET_TEMPLATES = [
  "Mentioned in connection with recent activity near {sector}.",
  "Referenced alongside another tracked entity in a public post.",
  "Appears in an indexed public record dated within the last quarter.",
  "Flagged by keyword monitoring for association with a tracked location.",
  "Cross-referenced against a known cluster with moderate confidence.",
  "Noted in an archived listing with partial identifying details.",
];

const OSINT_COUNT = 60;

function getSectorNameSafe(sectorId) {
  const s = SECTORS.find((sec) => sec.id === sectorId);
  return s ? s.name.replace(/^Sector \d+ — /, "") : "an unspecified sector";
}

export const OSINT_MENTIONS = Array.from({ length: OSINT_COUNT }, (_, i) => {
  const entity = pick(ENTITIES);
  const source = pick(OSINT_SOURCES);
  const sector = getSectorNameSafe(entity.sectorId);
  return {
    id: `OSN-${i + 1}`,
    entityId: entity.id,
    sourceId: source.id,
    snippet: pick(OSINT_SNIPPET_TEMPLATES).replace("{sector}", sector),
    confidence: randInt(30, 97),
    timestamp: `2026-0${randInt(3, 7)}-${String(randInt(1, 28)).padStart(2, "0")}T${String(
      randInt(6, 22)
    ).padStart(2, "0")}:${String(randInt(0, 59)).padStart(2, "0")}:00Z`,
  };
}).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

/* ---------- selectors ---------- */

export const getEntityById = (id) => ENTITIES.find((e) => e.id === id);

export const getRelationshipsForEntity = (id) =>
  RELATIONSHIPS.filter((r) => r.source === id || r.target === id);

export const getEntitiesBySector = (sectorId) => bySector(sectorId);

export const getAlertsBySector = (sectorId) => ALERTS.filter((a) => a.sectorId === sectorId);

export const getSectorById = (id) => SECTORS.find((s) => s.id === id);

export const getOsintMentionsForEntity = (entityId) =>
  OSINT_MENTIONS.filter((m) => m.entityId === entityId);

export const getSourceById = (id) => OSINT_SOURCES.find((s) => s.id === id);

export const OSINT_FEEDS = OSINT_MENTIONS.map((m) => ({
  id: m.id,
  title: m.snippet,
  source: m.sourceId,
  category: "public_records",
  confidence: m.confidence,
  severity: m.confidence >= 80 ? "critical" : m.confidence >= 60 ? "high" : "medium",
  relatedEntityId: m.entityId,
  timestamp: m.timestamp,
  status: m.confidence >= 70 ? "actionable" : "new",
}));

export const REPORTS = [
  {
    id: "REP-01",
    title: "Sector 04 Trafficking Route Analysis",
    type: "network_analysis",
    status: "completed",
    createdAt: "2026-07-28",
    summary: "Comprehensive graph analysis of entity clusters operating in Sector 04 corridor.",
    entityCount: 14,
    alertCount: 5,
  },
  {
    id: "REP-02",
    title: "Precursor Chemical Supply Linkage",
    type: "anomaly_report",
    status: "completed",
    createdAt: "2026-08-02",
    summary: "Anomalous purchasing patterns identified across chemical suppliers in Sector 08.",
    entityCount: 8,
    alertCount: 3,
  },
  {
    id: "REP-03",
    title: "Financial Intermediary Network Dossier",
    type: "entity_dossier",
    status: "in_progress",
    createdAt: "2026-08-06",
    summary: "Investigation into money laundering entities and offshore account networks.",
    entityCount: 12,
    alertCount: 4,
  },
];

export const DATASET_SUMMARY = {
  totalEntities: ENTITIES.length,
  totalRelationships: RELATIONSHIPS.length,
  totalSectors: SECTORS.length,
  totalAlerts: ALERTS.length,
  activeInvestigations: INVESTIGATIONS.filter((i) => i.status !== "closed").length,
  totalAnomalies: ANOMALIES.length,
};