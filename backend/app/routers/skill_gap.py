from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.services.skill_gap import calculate_skill_gap, get_latest_skill_gap


router = APIRouter(prefix="/api/v1/skill-gap", tags=["skill-gap"])


class SkillGapRequest(BaseModel):
    role_id: int


class MissingSkillResponse(BaseModel):
    id: int
    name: str
    importance: int
    difficulty: str | None
    priority_score: float
    priority: str


class SkillGapResponse(BaseModel):
    id: int
    user_id: int
    role_id: int
    role: str
    overall_score: float
    missing_skills: list[MissingSkillResponse]
    generated_at: datetime


@router.post("/analyze", response_model=SkillGapResponse, status_code=status.HTTP_201_CREATED)
def analyze_skill_gap(
    payload: SkillGapRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, object]:
    try:
        return calculate_skill_gap(user.id, payload.role_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/latest", response_model=SkillGapResponse)
def latest_skill_gap(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, object]:
    result = get_latest_skill_gap(user.id, db)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No skill gap analysis found"
        )
    return result
