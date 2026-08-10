from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.intelligence import CareerAnalysisRequest, CareerAnalysisResponse
from app.services.ai_context import build_ai_context
from app.services.ai_intelligence import (
    IntelligenceGenerationError,
    generate_career_analysis,
)


router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])


@router.post("/analyze", response_model=CareerAnalysisResponse)
def analyze_career(
    payload: CareerAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    provider: AIProvider = Depends(get_ai_provider),
) -> CareerAnalysisResponse:
    context = build_ai_context(db, current_user.id)
    try:
        return generate_career_analysis(context, payload.focus, provider)
    except IntelligenceGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to generate a valid career analysis",
        ) from exc
