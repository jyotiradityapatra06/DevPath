from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.weekly_planner import WeeklyLearningPlanResponse
from app.services.ai_context import build_ai_context
from app.services.weekly_planner import WeeklyPlannerError, WeeklyPlannerService


router = APIRouter(prefix="/planner", tags=["AI Planner"])


@router.post("/weekly-plan", response_model=WeeklyLearningPlanResponse)
def generate_weekly_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    provider: AIProvider = Depends(get_ai_provider),
) -> WeeklyLearningPlanResponse:
    context = jsonable_encoder(build_ai_context(db, current_user.id))
    try:
        return WeeklyPlannerService(provider).generate_plan(context)
    except WeeklyPlannerError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to generate a valid weekly learning plan",
        ) from exc
