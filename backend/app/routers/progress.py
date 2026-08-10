from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.progress import Progress
from app.models.user import User
from app.schemas.progress import (
    ProgressResponse,
    ProgressUpdate,
    RoadmapProgressResponse,
)
from app.services.progress import (
    RoadmapNotFoundError,
    RoadmapStepNotFoundError,
    get_roadmap_progress,
    list_user_progress,
    update_step_progress,
)


router = APIRouter(prefix="/api/v1/progress", tags=["progress"])


def _response(progress: Progress) -> ProgressResponse:
    return ProgressResponse(
        id=progress.id,
        step_id=progress.step_id,
        roadmap_id=progress.step.roadmap_id,
        step=progress.step.title,
        status=progress.status,
        completed_at=progress.completed_at,
    )


@router.put("/{step_id}", response_model=ProgressResponse)
def update_progress(
    step_id: int,
    payload: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressResponse:
    try:
        return _response(update_step_progress(db, current_user.id, step_id, payload))
    except RoadmapStepNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/me", response_model=list[ProgressResponse])
def get_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressResponse]:
    return [_response(item) for item in list_user_progress(db, current_user.id)]


@router.get("/roadmap/{roadmap_id}", response_model=RoadmapProgressResponse)
def get_progress_for_roadmap(
    roadmap_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapProgressResponse:
    try:
        return get_roadmap_progress(db, current_user.id, roadmap_id)
    except RoadmapNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
