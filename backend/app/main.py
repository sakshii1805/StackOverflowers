import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

logger = logging.getLogger("narcoscope")


# ── Lifespan: DB init + seed on startup ─────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup / shutdown lifecycle."""
    # Startup
    logger.info("NARCOSCOPE backend starting (DEMO_MODE=%s)", settings.DEMO_MODE)

    # Create tables
    from app.db.seed import create_tables, seed_database
    create_tables()
    logger.info("Database tables verified / created")

    # Auto-seed if in demo mode
    if settings.DEMO_MODE and settings.AUTO_SEED:
        result = seed_database()
        logger.info("Seed result: %s", result)

    yield

    # Shutdown
    logger.info("NARCOSCOPE backend shutting down")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API service for NARCOSCOPE Intelligence Platform",
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS Configuration
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Root Health Route
@app.get("/api/health")
def health_check():
    """Health check with database connectivity status."""
    health = {
        "status": "ok",
        "service": "narcoscope-backend",
        "demo_mode": settings.DEMO_MODE,
        "version": settings.VERSION,
    }

    # Check database connectivity
    try:
        from app.db.session import SessionLocal
        from app.models.entity import Entity
        db = SessionLocal()
        try:
            entity_count = db.query(Entity).count()
            health["database"] = "connected"
            health["entity_count"] = entity_count
        finally:
            db.close()
    except Exception as exc:
        health["database"] = "error"
        health["database_error"] = str(exc)

    return health


# Include Master API Router
app.include_router(api_router, prefix="/api")
