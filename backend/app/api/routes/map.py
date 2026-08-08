from fastapi import APIRouter

router = APIRouter(prefix="/map", tags=["Activity Map"])


@router.get("/health")
def map_health():
    return {"module": "map", "status": "active"}
