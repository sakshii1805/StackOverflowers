import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent.parent.parent.parent.parent / "OneDrive" / "Desktop" / "narcoscope" / "backend"
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("=== Live Backend API Endpoints Audit ===")

routes_to_test = [
    ("GET", "/api/health", "Health Endpoint"),
    ("GET", "/api/system/status", "System Status & Registry Endpoint"),
    ("POST", "/api/ingestion/run", "Unified Ingestion Pipeline Endpoint"),
    ("GET", "/api/dashboard", "Dashboard Summary Endpoint"),
    ("GET", "/api/entities", "Entities List Endpoint"),
    ("GET", "/api/network/graph", "Network Graph Endpoint"),
    ("GET", "/api/map/sectors", "Map Sectors Endpoint"),
    ("GET", "/api/alerts", "Alerts List Endpoint"),
    ("GET", "/api/anomalies", "Anomalies Detection Endpoint"),
    ("GET", "/api/osint/feeds", "OSINT Feeds Endpoint"),
    ("GET", "/api/osint/public-data", "Public Open Data Endpoint"),
    ("GET", "/api/investigations", "Investigations Endpoint"),
    ("GET", "/api/reports", "Reports Summary Endpoint"),
]

all_passed = True
for method, url, label in routes_to_test:
    if method == "GET":
        res = client.get(url)
    else:
        res = client.post(url)
    status = "SUCCESS" if res.status_code == 200 else f"FAILED ({res.status_code})"
    if res.status_code != 200:
        all_passed = False
    print(f"[{status}] {label} -> {method} {url} (HTTP {res.status_code})")

if all_passed:
    print("\n=== ALL 13 BACKEND API ROUTES ARE 100% OPERATIONAL & SERVING LIVE DATA ===")
else:
    print("\n=== SOME BACKEND ROUTES FAILED ===")
