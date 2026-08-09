from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.personalization import RecommendationResponse
from app.services.personalization import (
    generate_personalized_recommendations,
    get_recommendation,
    get_recommendations,
)


router = APIRouter(prefix="/api/v1/personalization", tags=["personalization"])


@router.post(
    "/analyze",
    response_model=list[RecommendationResponse],
    status_code=status.HTTP_201_CREATED,
)
def analyze(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RecommendationResponse]:
    try:
        return generate_personalized_recommendations(db, current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/recommendations", response_model=list[RecommendationResponse])
def list_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RecommendationResponse]:
    return get_recommendations(db, current_user.id)


@router.get("/recommendations/{recommendation_id}", response_model=RecommendationResponse)
def retrieve_recommendation(
    recommendation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RecommendationResponse:
    recommendation = get_recommendation(db, current_user.id, recommendation_id)
    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Recommendation not found"
        )
    return recommendation
