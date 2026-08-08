"""
Synthetic data seeder for NARCOSCOPE demo mode.

Populates the database with realistic (but clearly fictional) narcotics
intelligence data: entities, relationships, events, alerts, investigations,
notes, and reports.

Run standalone:
    python -m app.db.seed

Or automatically on app startup when DEMO_MODE=True and DB is empty.
"""

import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.entity import Entity, EntityType, EntityStatus
from app.models.relationship import Relationship, RelationshipType
from app.models.event import Event, EventType, Severity, event_entity_table
from app.models.alert import Alert, AlertType
from app.models.investigation import (
    Investigation,
    InvestigationNote,
    InvestigationStatus,
    Priority,
    investigation_entity_table,
)
from app.models.report import Report, ReportType


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _ago(**kwargs) -> datetime:
    return _now() - timedelta(**kwargs)


# ═══════════════════════════════════════════════════════════════════════════
# ENTITY DATA
# ═══════════════════════════════════════════════════════════════════════════

def _create_entities(db: Session) -> dict[str, Entity]:
    """Create ~15 synthetic entities and return a name→Entity dict."""
    entities_data = [
        # ── Persons ─────────────────────────────────────────────────
        {
            "name": "Carlos 'El Fantasma' Reyes",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Suspected cartel leader operating in the western corridor. Multiple aliases detected across intercepted communications.",
            "risk_score": 92.0,
            "status": EntityStatus.under_investigation,
            "aliases": ["El Fantasma", "C. Reyes", "Ghost"],
            "metadata_": {"nationality": "Synthetic-Country-A", "age_range": "40-50"},
            "first_seen": _ago(days=730),
            "last_seen": _ago(days=2),
        },
        {
            "name": "Maria Santos Delgado",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Known courier and logistics coordinator. Linked to multiple cross-border shipments.",
            "risk_score": 78.5,
            "status": EntityStatus.active,
            "aliases": ["La Paloma", "M. Santos"],
            "metadata_": {"nationality": "Synthetic-Country-B", "age_range": "30-35"},
            "first_seen": _ago(days=365),
            "last_seen": _ago(days=5),
        },
        {
            "name": "Viktor Petrov",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Financial intermediary with connections to offshore accounts. Suspected money laundering.",
            "risk_score": 85.0,
            "status": EntityStatus.under_investigation,
            "aliases": ["V. Petrov", "The Banker"],
            "metadata_": {"nationality": "Synthetic-Country-C", "age_range": "45-55"},
            "first_seen": _ago(days=500),
            "last_seen": _ago(days=10),
        },
        {
            "name": "Diego Fuentes",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Street-level distributor turned mid-level coordinator. Rapid rise through organization.",
            "risk_score": 65.0,
            "status": EntityStatus.active,
            "aliases": ["El Rapido"],
            "metadata_": {"age_range": "25-30"},
            "first_seen": _ago(days=200),
            "last_seen": _ago(days=1),
        },
        {
            "name": "Yuki Tanaka",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Chemical precursor supplier. Academic background in organic chemistry.",
            "risk_score": 71.0,
            "status": EntityStatus.active,
            "aliases": ["Dr. T"],
            "metadata_": {"nationality": "Synthetic-Country-D", "occupation": "Chemist"},
            "first_seen": _ago(days=400),
            "last_seen": _ago(days=15),
        },
        {
            "name": "James 'Jimmy' O'Brien",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Cleared after investigation. Former associate, now cooperating witness.",
            "risk_score": 12.0,
            "status": EntityStatus.cleared,
            "aliases": ["Jimmy O"],
            "metadata_": {},
            "first_seen": _ago(days=600),
            "last_seen": _ago(days=90),
        },
        # ── Organizations ───────────────────────────────────────────
        {
            "name": "Solaris Trading Group",
            "entity_type": EntityType.organization,
            "description": "[SYNTHETIC] Shell company suspected of laundering proceeds through import/export operations.",
            "risk_score": 88.0,
            "status": EntityStatus.under_investigation,
            "aliases": ["Solaris TG", "STG Holdings"],
            "metadata_": {"registered_country": "Synthetic-Country-E", "industry": "Import/Export"},
            "first_seen": _ago(days=450),
            "last_seen": _ago(days=3),
        },
        {
            "name": "Corredor Occidental Cartel",
            "entity_type": EntityType.organization,
            "description": "[SYNTHETIC] Major narcotics trafficking organization controlling western supply routes.",
            "risk_score": 97.0,
            "status": EntityStatus.under_investigation,
            "aliases": ["COC", "Western Corridor"],
            "metadata_": {"estimated_members": "200-500", "primary_product": "Synthetic substances"},
            "first_seen": _ago(days=1095),
            "last_seen": _ago(days=1),
        },
        # ── Vehicles ────────────────────────────────────────────────
        {
            "name": "White Cargo Van — SYN-4821",
            "entity_type": EntityType.vehicle,
            "description": "[SYNTHETIC] Cargo van spotted at multiple seizure locations. Registered to a shell company.",
            "risk_score": 55.0,
            "status": EntityStatus.active,
            "aliases": [],
            "metadata_": {"make": "Generic", "model": "Cargo Van", "plate": "SYN-4821"},
            "first_seen": _ago(days=120),
            "last_seen": _ago(days=8),
        },
        # ── Phones ──────────────────────────────────────────────────
        {
            "name": "Burner Phone +1-555-0147",
            "entity_type": EntityType.phone,
            "description": "[SYNTHETIC] Prepaid device linked to encrypted communications between El Fantasma and Solaris TG.",
            "risk_score": 60.0,
            "status": EntityStatus.active,
            "aliases": [],
            "metadata_": {"carrier": "Synthetic Telecom", "imei": "000000000000000"},
            "first_seen": _ago(days=60),
            "last_seen": _ago(days=4),
        },
        # ── Locations ───────────────────────────────────────────────
        {
            "name": "Warehouse District — Port Ficticio",
            "entity_type": EntityType.location,
            "description": "[SYNTHETIC] Industrial zone near port. Multiple surveillance reports of late-night cargo activity.",
            "risk_score": 72.0,
            "status": EntityStatus.active,
            "aliases": ["Zona Industrial PF"],
            "metadata_": {"latitude": 25.6866, "longitude": -100.3161, "city": "Port Ficticio"},
            "first_seen": _ago(days=300),
            "last_seen": _ago(days=6),
        },
        {
            "name": "Safe House — Colonia Verde",
            "entity_type": EntityType.location,
            "description": "[SYNTHETIC] Residential property used as a coordination point. Utility bills paid by Solaris TG.",
            "risk_score": 68.0,
            "status": EntityStatus.active,
            "aliases": [],
            "metadata_": {"latitude": 20.6597, "longitude": -103.3496, "city": "Colonia Verde"},
            "first_seen": _ago(days=180),
            "last_seen": _ago(days=12),
        },
        # ── Financial accounts ──────────────────────────────────────
        {
            "name": "Offshore Account — SYNBANK-7743",
            "entity_type": EntityType.financial_account,
            "description": "[SYNTHETIC] Offshore bank account receiving wire transfers from Solaris TG. Flagged by financial intelligence.",
            "risk_score": 82.0,
            "status": EntityStatus.under_investigation,
            "aliases": ["SYNBANK-7743"],
            "metadata_": {"bank": "Synthetic International Bank", "country": "Synthetic-Country-F"},
            "first_seen": _ago(days=350),
            "last_seen": _ago(days=20),
        },
        {
            "name": "Crypto Wallet — 0xSYN...DEMO",
            "entity_type": EntityType.financial_account,
            "description": "[SYNTHETIC] Cryptocurrency wallet used for layering transactions. Unusual volume spikes detected.",
            "risk_score": 75.0,
            "status": EntityStatus.active,
            "aliases": ["0xSYNDEMO"],
            "metadata_": {"blockchain": "Synthetic Chain", "total_txns": 347},
            "first_seen": _ago(days=150),
            "last_seen": _ago(days=3),
        },
        {
            "name": "Rosa Medina Castillo",
            "entity_type": EntityType.person,
            "description": "[SYNTHETIC] Accountant linked to Solaris Trading Group. Manages shell company finances.",
            "risk_score": 58.0,
            "status": EntityStatus.active,
            "aliases": ["R. Medina"],
            "metadata_": {"occupation": "Accountant"},
            "first_seen": _ago(days=250),
            "last_seen": _ago(days=7),
        },
    ]

    result: dict[str, Entity] = {}
    for data in entities_data:
        entity = Entity(id=str(uuid.uuid4()), **data)
        db.add(entity)
        result[entity.name] = entity
    db.flush()
    return result


# ═══════════════════════════════════════════════════════════════════════════
# RELATIONSHIP DATA
# ═══════════════════════════════════════════════════════════════════════════

def _create_relationships(db: Session, entities: dict[str, Entity]) -> list[Relationship]:
    """Create ~20 relationships forming a realistic network topology."""
    e = entities  # shorthand

    rels_data = [
        # Command structure
        (e["Carlos 'El Fantasma' Reyes"], e["Corredor Occidental Cartel"], RelationshipType.command, 0.95,
         "Leader of the organization per multiple HUMINT sources."),
        (e["Carlos 'El Fantasma' Reyes"], e["Maria Santos Delgado"], RelationshipType.command, 0.80,
         "Direct reports seen in intercepted encrypted messages."),
        (e["Carlos 'El Fantasma' Reyes"], e["Diego Fuentes"], RelationshipType.command, 0.65,
         "Indirect command through intermediaries."),
        # Associates
        (e["Maria Santos Delgado"], e["Diego Fuentes"], RelationshipType.associate, 0.70,
         "Frequent co-location at logistics hubs."),
        (e["Diego Fuentes"], e["White Cargo Van — SYN-4821"], RelationshipType.logistics, 0.85,
         "Vehicle registered under alias linked to Fuentes."),
        (e["Maria Santos Delgado"], e["Warehouse District — Port Ficticio"], RelationshipType.logistics, 0.75,
         "Surveillance footage at warehouse on 5 occasions."),
        # Financial
        (e["Viktor Petrov"], e["Solaris Trading Group"], RelationshipType.financial, 0.90,
         "CFO of Solaris TG per corporate filings."),
        (e["Solaris Trading Group"], e["Offshore Account — SYNBANK-7743"], RelationshipType.financial, 0.92,
         "Wire transfers totaling $2.3M over 18 months."),
        (e["Viktor Petrov"], e["Offshore Account — SYNBANK-7743"], RelationshipType.financial, 0.88,
         "Signatory on account. Multiple cash deposits."),
        (e["Rosa Medina Castillo"], e["Solaris Trading Group"], RelationshipType.financial, 0.80,
         "Employed as senior accountant since founding."),
        (e["Solaris Trading Group"], e["Crypto Wallet — 0xSYN...DEMO"], RelationshipType.financial, 0.65,
         "On-chain analysis links wallet to STG controlled addresses."),
        # Communications
        (e["Carlos 'El Fantasma' Reyes"], e["Burner Phone +1-555-0147"], RelationshipType.communication, 0.85,
         "Phone attributed to El Fantasma via voice analysis."),
        (e["Burner Phone +1-555-0147"], e["Solaris Trading Group"], RelationshipType.communication, 0.60,
         "Calls to Solaris TG office from this device."),
        (e["Yuki Tanaka"], e["Maria Santos Delgado"], RelationshipType.associate, 0.55,
         "Email exchanges regarding 'chemical supplies'."),
        # Supply chain
        (e["Yuki Tanaka"], e["Corredor Occidental Cartel"], RelationshipType.logistics, 0.70,
         "Precursor chemicals sourced and shipped to COC labs."),
        (e["Corredor Occidental Cartel"], e["Warehouse District — Port Ficticio"], RelationshipType.logistics, 0.90,
         "Primary staging area for western corridor shipments."),
        (e["Maria Santos Delgado"], e["Safe House — Colonia Verde"], RelationshipType.logistics, 0.72,
         "Utility records and surveillance confirm regular visits."),
        # Family
        (e["Diego Fuentes"], e["Rosa Medina Castillo"], RelationshipType.family, 0.95,
         "Siblings per civil records."),
        # Former associate
        (e["James 'Jimmy' O'Brien"], e["Carlos 'El Fantasma' Reyes"], RelationshipType.associate, 0.30,
         "Former associate, now cooperating witness. Relationship severed."),
        (e["James 'Jimmy' O'Brien"], e["Viktor Petrov"], RelationshipType.financial, 0.25,
         "Historical financial connection, no longer active."),
    ]

    rels: list[Relationship] = []
    for source, target, rel_type, strength, evidence in rels_data:
        rel = Relationship(
            id=str(uuid.uuid4()),
            source_entity_id=source.id,
            target_entity_id=target.id,
            relationship_type=rel_type,
            strength=strength,
            evidence_summary=f"[SYNTHETIC] {evidence}",
            first_observed=_ago(days=int(365 * strength)),
            last_observed=_ago(days=int(30 * (1 - strength))),
        )
        db.add(rel)
        rels.append(rel)
    db.flush()
    return rels


# ═══════════════════════════════════════════════════════════════════════════
# EVENT DATA
# ═══════════════════════════════════════════════════════════════════════════

def _create_events(db: Session, entities: dict[str, Entity]) -> list[Event]:
    """Create ~15 synthetic intelligence events with geo-coordinates."""
    e = entities

    events_data = [
        {
            "event_type": EventType.seizure,
            "title": "Port Ficticio Warehouse Seizure",
            "description": "[SYNTHETIC] 450kg of synthetic substances seized from cargo containers at Port Ficticio warehouse district.",
            "latitude": 25.6866, "longitude": -100.3161,
            "location_name": "Port Ficticio — Warehouse District",
            "occurred_at": _ago(days=14),
            "severity": Severity.critical,
            "linked_entities": ["Warehouse District — Port Ficticio", "Maria Santos Delgado", "White Cargo Van — SYN-4821"],
        },
        {
            "event_type": EventType.transaction,
            "title": "Suspicious Wire Transfer — $850K",
            "description": "[SYNTHETIC] Large wire transfer from Solaris TG to offshore account. Amount exceeds normal trade volumes by 400%.",
            "latitude": 40.7128, "longitude": -74.0060,
            "location_name": "Synthetic Financial District",
            "occurred_at": _ago(days=21),
            "severity": Severity.high,
            "linked_entities": ["Solaris Trading Group", "Offshore Account — SYNBANK-7743", "Viktor Petrov"],
        },
        {
            "event_type": EventType.meeting,
            "title": "Suspected Leadership Meeting",
            "description": "[SYNTHETIC] Surveillance detected El Fantasma, Santos, and Petrov at same restaurant. 2-hour meeting.",
            "latitude": 19.4326, "longitude": -99.1332,
            "location_name": "Restaurante El Sol — Capital City",
            "occurred_at": _ago(days=7),
            "severity": Severity.high,
            "linked_entities": ["Carlos 'El Fantasma' Reyes", "Maria Santos Delgado", "Viktor Petrov"],
        },
        {
            "event_type": EventType.border_crossing,
            "title": "Border Crossing — Cargo Van SYN-4821",
            "description": "[SYNTHETIC] Vehicle SYN-4821 crossed southern border checkpoint. Cargo declared as 'industrial supplies'.",
            "latitude": 32.5149, "longitude": -117.0382,
            "location_name": "Southern Border Checkpoint Alpha",
            "occurred_at": _ago(days=10),
            "severity": Severity.medium,
            "linked_entities": ["White Cargo Van — SYN-4821", "Diego Fuentes"],
        },
        {
            "event_type": EventType.communication,
            "title": "Encrypted Call — Burner to Solaris",
            "description": "[SYNTHETIC] 47-minute encrypted call from burner device to Solaris TG landline. Content unknown.",
            "latitude": 25.6866, "longitude": -100.3161,
            "location_name": "Cell Tower — Port Ficticio Region",
            "occurred_at": _ago(days=4),
            "severity": Severity.medium,
            "linked_entities": ["Burner Phone +1-555-0147", "Solaris Trading Group"],
        },
        {
            "event_type": EventType.sighting,
            "title": "El Fantasma Spotted — Capital City",
            "description": "[SYNTHETIC] Confidential informant reports sighting of subject matching El Fantasma description at luxury hotel.",
            "latitude": 19.4260, "longitude": -99.1680,
            "location_name": "Hotel Grand Synthetic — Capital City",
            "occurred_at": _ago(days=3),
            "severity": Severity.high,
            "linked_entities": ["Carlos 'El Fantasma' Reyes"],
        },
        {
            "event_type": EventType.transaction,
            "title": "Crypto Volume Spike — 0xSYN Wallet",
            "description": "[SYNTHETIC] 23 transactions in 4 hours totaling $340K in synthetic token. Pattern consistent with layering.",
            "latitude": None, "longitude": None,
            "location_name": "On-chain — Synthetic Blockchain",
            "occurred_at": _ago(days=5),
            "severity": Severity.medium,
            "linked_entities": ["Crypto Wallet — 0xSYN...DEMO", "Solaris Trading Group"],
        },
        {
            "event_type": EventType.seizure,
            "title": "Precursor Chemical Interception",
            "description": "[SYNTHETIC] 200L of synthetic precursor chemicals intercepted at cargo terminal. Shipping docs link to Dr. T.",
            "latitude": 35.6762, "longitude": 139.6503,
            "location_name": "Synthetic Cargo Terminal East",
            "occurred_at": _ago(days=30),
            "severity": Severity.high,
            "linked_entities": ["Yuki Tanaka", "Corredor Occidental Cartel"],
        },
        {
            "event_type": EventType.arrest,
            "title": "Diego Fuentes — Traffic Stop Arrest",
            "description": "[SYNTHETIC] Fuentes arrested during routine traffic stop. Small quantity found. Released on bail pending investigation.",
            "latitude": 29.7604, "longitude": -95.3698,
            "location_name": "Highway 10 — Synthetic County",
            "occurred_at": _ago(days=45),
            "severity": Severity.medium,
            "linked_entities": ["Diego Fuentes", "White Cargo Van — SYN-4821"],
        },
        {
            "event_type": EventType.tip,
            "title": "Anonymous Tip — Safe House Location",
            "description": "[SYNTHETIC] Anonymous call to tip line providing address of suspected safe house in Colonia Verde.",
            "latitude": 20.6597, "longitude": -103.3496,
            "location_name": "Colonia Verde — Residential Area",
            "occurred_at": _ago(days=60),
            "severity": Severity.medium,
            "linked_entities": ["Safe House — Colonia Verde"],
        },
        {
            "event_type": EventType.meeting,
            "title": "Tanaka-Santos Chemical Negotiation",
            "description": "[SYNTHETIC] Intercepted email suggests meeting between Tanaka and Santos to discuss precursor supply terms.",
            "latitude": 13.7563, "longitude": 100.5018,
            "location_name": "Synthetic Hotel — Southeast Asia Hub",
            "occurred_at": _ago(days=90),
            "severity": Severity.medium,
            "linked_entities": ["Yuki Tanaka", "Maria Santos Delgado"],
        },
        {
            "event_type": EventType.transaction,
            "title": "Medina Cash Deposit — $49,900",
            "description": "[SYNTHETIC] Rosa Medina deposited $49,900 (just under reporting threshold) at three different bank branches.",
            "latitude": 25.6866, "longitude": -100.3161,
            "location_name": "Multiple Banks — Port Ficticio",
            "occurred_at": _ago(days=18),
            "severity": Severity.high,
            "linked_entities": ["Rosa Medina Castillo", "Solaris Trading Group"],
        },
        {
            "event_type": EventType.sighting,
            "title": "Cargo Van at Border — Return Trip",
            "description": "[SYNTHETIC] Van SYN-4821 detected by ALPR on return trip through border region. Empty cargo area.",
            "latitude": 31.7619, "longitude": -106.4850,
            "location_name": "ALPR Station — Eastern Border Route",
            "occurred_at": _ago(days=8),
            "severity": Severity.low,
            "linked_entities": ["White Cargo Van — SYN-4821"],
        },
        {
            "event_type": EventType.communication,
            "title": "O'Brien Debrief — Intel Report",
            "description": "[SYNTHETIC] Cooperating witness O'Brien provided debrief on historical org structure and financial methods.",
            "latitude": 38.8951, "longitude": -77.0364,
            "location_name": "Synthetic Federal Building",
            "occurred_at": _ago(days=85),
            "severity": Severity.low,
            "linked_entities": ["James 'Jimmy' O'Brien"],
        },
        {
            "event_type": EventType.seizure,
            "title": "Colonia Verde Safe House Raid",
            "description": "[SYNTHETIC] Raid on Colonia Verde safe house recovered communications equipment, ledgers, and $125K in cash.",
            "latitude": 20.6597, "longitude": -103.3496,
            "location_name": "Safe House — Colonia Verde",
            "occurred_at": _ago(days=55),
            "severity": Severity.critical,
            "linked_entities": ["Safe House — Colonia Verde", "Maria Santos Delgado", "Diego Fuentes"],
        },
    ]

    events: list[Event] = []
    for data in events_data:
        linked = data.pop("linked_entities")
        event = Event(id=str(uuid.uuid4()), **data)
        # Link entities via M2M
        for ename in linked:
            if ename in e:
                event.entities.append(e[ename])
        db.add(event)
        events.append(event)
    db.flush()
    return events


# ═══════════════════════════════════════════════════════════════════════════
# ALERT DATA
# ═══════════════════════════════════════════════════════════════════════════

def _create_alerts(db: Session, entities: dict[str, Entity], events: list[Event]) -> list[Alert]:
    """Create ~10 synthetic alerts."""
    e = entities

    alerts_data = [
        {
            "alert_type": AlertType.anomaly,
            "title": "Unusual Financial Volume — Solaris TG",
            "description": "[SYNTHETIC] Transaction volume for Solaris TG exceeded 3σ above the 90-day rolling average.",
            "severity": Severity.critical,
            "is_read": False,
            "entity_id": e["Solaris Trading Group"].id,
        },
        {
            "alert_type": AlertType.risk_change,
            "title": "Risk Score Increase — Diego Fuentes",
            "description": "[SYNTHETIC] Risk score increased from 45 to 65 following arrest and new relationship evidence.",
            "severity": Severity.high,
            "is_read": False,
            "entity_id": e["Diego Fuentes"].id,
        },
        {
            "alert_type": AlertType.pattern,
            "title": "Structuring Pattern Detected — Rosa Medina",
            "description": "[SYNTHETIC] Three sub-$50K deposits on the same day across different branches matches structuring pattern.",
            "severity": Severity.high,
            "is_read": True,
            "entity_id": e["Rosa Medina Castillo"].id,
            "acknowledged_at": _ago(days=1),
        },
        {
            "alert_type": AlertType.new_entity,
            "title": "New Entity Discovered — Crypto Wallet",
            "description": "[SYNTHETIC] On-chain analysis identified a previously unknown wallet linked to Solaris TG addresses.",
            "severity": Severity.medium,
            "is_read": True,
            "entity_id": e["Crypto Wallet — 0xSYN...DEMO"].id,
            "acknowledged_at": _ago(days=5),
        },
        {
            "alert_type": AlertType.anomaly,
            "title": "Geographic Anomaly — Van SYN-4821",
            "description": "[SYNTHETIC] Vehicle detected in 3 different border regions within 48 hours. Impossible without relay drivers.",
            "severity": Severity.medium,
            "is_read": False,
            "entity_id": e["White Cargo Van — SYN-4821"].id,
        },
        {
            "alert_type": AlertType.threshold,
            "title": "Communication Frequency Spike — Burner Phone",
            "description": "[SYNTHETIC] Call frequency from burner device exceeded 15 calls/day threshold for 3 consecutive days.",
            "severity": Severity.medium,
            "is_read": False,
            "entity_id": e["Burner Phone +1-555-0147"].id,
        },
        {
            "alert_type": AlertType.pattern,
            "title": "Coordination Pattern — Pre-Seizure Activity",
            "description": "[SYNTHETIC] Communication and logistics activity pattern matches pre-shipment coordination seen before previous seizures.",
            "severity": Severity.critical,
            "is_read": False,
            "entity_id": e["Corredor Occidental Cartel"].id,
        },
        {
            "alert_type": AlertType.risk_change,
            "title": "Risk Score Increase — Yuki Tanaka",
            "description": "[SYNTHETIC] New evidence from chemical interception increased risk assessment for precursor supplier.",
            "severity": Severity.high,
            "is_read": True,
            "entity_id": e["Yuki Tanaka"].id,
            "acknowledged_at": _ago(days=2),
        },
        {
            "alert_type": AlertType.anomaly,
            "title": "Nighttime Activity Spike — Port Ficticio",
            "description": "[SYNTHETIC] Surveillance cameras detected 8 vehicle arrivals between 01:00-04:00 at warehouse. Normal is 0-1.",
            "severity": Severity.high,
            "is_read": False,
            "entity_id": e["Warehouse District — Port Ficticio"].id,
        },
        {
            "alert_type": AlertType.threshold,
            "title": "Entity Connection Threshold — El Fantasma",
            "description": "[SYNTHETIC] Entity now has 8+ confirmed connections. Exceeds high-value target threshold of 6.",
            "severity": Severity.medium,
            "is_read": True,
            "entity_id": e["Carlos 'El Fantasma' Reyes"].id,
            "acknowledged_at": _ago(days=10),
        },
    ]

    alerts: list[Alert] = []
    for data in alerts_data:
        alert = Alert(id=str(uuid.uuid4()), **data)
        db.add(alert)
        alerts.append(alert)
    db.flush()
    return alerts


# ═══════════════════════════════════════════════════════════════════════════
# INVESTIGATION DATA
# ═══════════════════════════════════════════════════════════════════════════

def _create_investigations(db: Session, entities: dict[str, Entity]) -> list[Investigation]:
    """Create 3 synthetic investigations with linked entities and notes."""
    e = entities

    investigations_data = [
        {
            "title": "Operation Western Shadow",
            "description": "[SYNTHETIC] Multi-agency investigation into the Corredor Occidental Cartel's western corridor supply chain and financial infrastructure.",
            "status": InvestigationStatus.in_progress,
            "priority": Priority.critical,
            "lead_analyst": "Agent Rodriguez (Synthetic)",
            "linked_entities": [
                "Carlos 'El Fantasma' Reyes", "Corredor Occidental Cartel",
                "Maria Santos Delgado", "Solaris Trading Group", "Viktor Petrov",
            ],
            "notes": [
                ("Initial case opened based on HUMINT reporting and financial intelligence referral.", "Agent Rodriguez (Synthetic)"),
                ("Surveillance authorized for Port Ficticio warehouse. Camera installation confirmed.", "Agent Chen (Synthetic)"),
                ("Financial subpoena served to Synthetic International Bank for SYNBANK-7743 records.", "Agent Rodriguez (Synthetic)"),
                ("Link analysis reveals Solaris TG is the financial hub. Recommend expanding scope to include Medina.", "Analyst Park (Synthetic)"),
            ],
        },
        {
            "title": "Project Phantom Finance",
            "description": "[SYNTHETIC] Focused investigation into money laundering operations through Solaris Trading Group and associated offshore accounts.",
            "status": InvestigationStatus.in_progress,
            "priority": Priority.high,
            "lead_analyst": "Agent Thompson (Synthetic)",
            "linked_entities": [
                "Solaris Trading Group", "Viktor Petrov",
                "Offshore Account — SYNBANK-7743", "Rosa Medina Castillo",
                "Crypto Wallet — 0xSYN...DEMO",
            ],
            "notes": [
                ("Financial analysis shows classic trade-based money laundering. Invoices inflated by 300-500%.", "Agent Thompson (Synthetic)"),
                ("Blockchain analysis in progress. Wallet 0xSYN connected to mixer service.", "Crypto Analyst (Synthetic)"),
            ],
        },
        {
            "title": "Case File: Tanaka Precursors",
            "description": "[SYNTHETIC] Investigation into international chemical precursor supply chain linked to Dr. Yuki Tanaka.",
            "status": InvestigationStatus.open,
            "priority": Priority.medium,
            "lead_analyst": "Agent Nakamura (Synthetic)",
            "linked_entities": [
                "Yuki Tanaka", "Maria Santos Delgado", "Corredor Occidental Cartel",
            ],
            "notes": [
                ("International cooperation request filed with Synthetic-Country-D authorities.", "Agent Nakamura (Synthetic)"),
            ],
        },
    ]

    investigations: list[Investigation] = []
    for data in investigations_data:
        linked = data.pop("linked_entities")
        notes_data = data.pop("notes")

        inv = Investigation(id=str(uuid.uuid4()), **data)
        for ename in linked:
            if ename in e:
                inv.entities.append(e[ename])

        for i, (content, author) in enumerate(notes_data):
            note = InvestigationNote(
                id=str(uuid.uuid4()),
                content=f"[SYNTHETIC] {content}",
                author=author,
                created_at=_ago(days=30 - i * 5),
            )
            inv.notes.append(note)

        db.add(inv)
        investigations.append(inv)
    db.flush()
    return investigations


# ═══════════════════════════════════════════════════════════════════════════
# REPORT DATA
# ═══════════════════════════════════════════════════════════════════════════

def _create_reports(db: Session, investigations: list[Investigation]) -> list[Report]:
    """Create 3 synthetic intelligence reports."""
    reports_data = [
        {
            "title": "Daily Intelligence Brief — Western Corridor",
            "report_type": ReportType.daily_brief,
            "summary": "[SYNTHETIC] Summary of last 24-hour intelligence activity in the western corridor operational area.",
            "content": (
                "[SYNTHETIC REPORT]\n\n"
                "DAILY INTELLIGENCE BRIEF\n"
                "Classification: DEMO — NOT REAL INTELLIGENCE\n\n"
                "1. SITUATION OVERVIEW\n"
                "Activity in the western corridor remains elevated. Key indicators include:\n"
                "- Increased encrypted communications from known devices\n"
                "- Financial transaction volume spike at Solaris TG\n"
                "- Vehicle SYN-4821 detected at multiple border crossings\n\n"
                "2. KEY DEVELOPMENTS\n"
                "- Port Ficticio warehouse seizure yielded 450kg of synthetic substances\n"
                "- Leadership meeting observed in Capital City\n"
                "- New cryptocurrency wallet linked to Solaris TG network\n\n"
                "3. RECOMMENDED ACTIONS\n"
                "- Maintain surveillance on Port Ficticio warehouse\n"
                "- Expand financial investigation to include Medina accounts\n"
                "- Request international cooperation for Tanaka precursor chain\n"
            ),
            "investigation_id": investigations[0].id,
            "generated_by": "NARCOSCOPE AI",
        },
        {
            "title": "Entity Profile — Carlos 'El Fantasma' Reyes",
            "report_type": ReportType.entity_profile,
            "summary": "[SYNTHETIC] Comprehensive profile of primary subject including known connections, activities, and risk assessment.",
            "content": (
                "[SYNTHETIC REPORT]\n\n"
                "ENTITY PROFILE: Carlos 'El Fantasma' Reyes\n"
                "Classification: DEMO — NOT REAL INTELLIGENCE\n\n"
                "RISK SCORE: 92/100 (Critical)\n\n"
                "KNOWN ALIASES: El Fantasma, C. Reyes, Ghost\n\n"
                "ROLE: Suspected leader of Corredor Occidental Cartel\n\n"
                "CONNECTIONS: 8 confirmed links including:\n"
                "- Command: COC, Santos, Fuentes\n"
                "- Financial: Petrov (via Solaris TG)\n"
                "- Communication: Burner device +1-555-0147\n\n"
                "RECENT ACTIVITY:\n"
                "- Sighted at Capital City luxury hotel (3 days ago)\n"
                "- Leadership meeting with Santos and Petrov (7 days ago)\n"
                "- Active encrypted communications (4 days ago)\n"
            ),
            "investigation_id": investigations[0].id,
            "generated_by": "NARCOSCOPE AI",
        },
        {
            "title": "Network Analysis — Solaris TG Financial Web",
            "report_type": ReportType.network_analysis,
            "summary": "[SYNTHETIC] Graph analysis of financial flows through Solaris Trading Group and connected entities.",
            "content": (
                "[SYNTHETIC REPORT]\n\n"
                "NETWORK ANALYSIS: Solaris TG Financial Web\n"
                "Classification: DEMO — NOT REAL INTELLIGENCE\n\n"
                "TOPOLOGY: Hub-and-spoke model centered on Solaris TG\n"
                "TOTAL NODES: 6 | TOTAL EDGES: 8\n\n"
                "KEY FINDINGS:\n"
                "1. Solaris TG acts as the central financial hub\n"
                "2. Viktor Petrov is the key human node bridging cartel and financial infrastructure\n"
                "3. Layering occurs through: Trade invoices → Offshore accounts → Crypto → Cash deposits\n"
                "4. Rosa Medina facilitates cash integration through structured deposits\n\n"
                "VULNERABILITY ASSESSMENT:\n"
                "- Removing Petrov would disrupt 73% of identified financial flows\n"
                "- Freezing SYNBANK-7743 would block primary offshore channel\n"
                "- Medina arrest would expose cash integration method\n"
            ),
            "investigation_id": investigations[1].id,
            "generated_by": "NARCOSCOPE AI",
        },
    ]

    reports: list[Report] = []
    for data in reports_data:
        report = Report(id=str(uuid.uuid4()), **data)
        db.add(report)
        reports.append(report)
    db.flush()
    return reports


# ═══════════════════════════════════════════════════════════════════════════
# MAIN SEEDER
# ═══════════════════════════════════════════════════════════════════════════

def seed_database(db: Session | None = None) -> dict[str, int]:
    """
    Populate the database with synthetic demo data.

    Returns a dict of table_name → row_count for verification.
    """
    own_session = db is None
    if own_session:
        db = SessionLocal()

    try:
        # Check if data already exists
        existing = db.query(Entity).count()
        if existing > 0:
            return {"status": "skipped", "reason": "data_already_exists"}

        entities = _create_entities(db)
        relationships = _create_relationships(db, entities)
        events = _create_events(db, entities)
        alerts = _create_alerts(db, entities, events)
        investigations = _create_investigations(db, entities)
        reports = _create_reports(db, investigations)

        db.commit()

        return {
            "status": "seeded",
            "entities": len(entities),
            "relationships": len(relationships),
            "events": len(events),
            "alerts": len(alerts),
            "investigations": len(investigations),
            "reports": len(reports),
        }
    except Exception:
        db.rollback()
        raise
    finally:
        if own_session:
            db.close()


def create_tables():
    """Create all tables defined by the ORM models."""
    Base.metadata.create_all(bind=engine)


# ── CLI entrypoint ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("NARCOSCOPE - Synthetic Data Seeder")
    print("=" * 50)

    print("Creating tables...")
    create_tables()
    print("[OK] Tables created")

    print("Seeding data...")
    result = seed_database()
    print(f"[OK] Result: {result}")

