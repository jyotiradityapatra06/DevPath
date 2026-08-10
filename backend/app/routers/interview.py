from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.interview import InterviewPreparationResponse
from app.services.ai_context import build_ai_context
from app.services.interview_coach import InterviewCoachError, InterviewCoachService


router = APIRouter(prefix="/interview", tags=["AI Interview Coach"])


@router.post("/prepare", response_model=InterviewPreparationResponse)
def prepare_for_interview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    provider: AIProvider = Depends(get_ai_provider),
) -> InterviewPreparationResponse:
    context = jsonable_encoder(build_ai_context(db, current_user.id))
    try:
        return InterviewCoachService(provider).generate_interview_plan(context)
    except InterviewCoachError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to generate interview preparation",
        ) from exc
