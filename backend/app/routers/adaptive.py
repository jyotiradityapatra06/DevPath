from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.adaptive_ai import RoadmapOptimizationResponse
from app.services.ai_context import build_ai_context
from app.services.roadmap_optimizer import (
    RoadmapOptimizationError,
    RoadmapOptimizerService,
)


router = APIRouter(
    prefix="/adaptive",
    tags=["Adaptive AI"],
)


@router.post("/roadmap-optimize", response_model=RoadmapOptimizationResponse)
def optimize_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    provider: AIProvider = Depends(get_ai_provider),
) -> RoadmapOptimizationResponse:
    context = jsonable_encoder(build_ai_context(db, current_user.id))
    try:
        return RoadmapOptimizerService(provider).optimize(context)
    except RoadmapOptimizationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to generate a valid roadmap optimization",
        ) from exc
