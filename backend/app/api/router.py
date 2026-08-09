from fastapi import APIRouter

from app.api.routes import (
    alerts,
    anomalies,
    auth,
    dashboard,
    entities,
    ingestion,
    investigations,
    map,
    network,
    osint,
    reports,
    system,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(entities.router)
api_router.include_router(alerts.router)
api_router.include_router(network.router)
api_router.include_router(map.router)
api_router.include_router(anomalies.router)
api_router.include_router(osint.router)
api_router.include_router(investigations.router)
api_router.include_router(reports.router)
api_router.include_router(system.router)
api_router.include_router(ingestion.router)
