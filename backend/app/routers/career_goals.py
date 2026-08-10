from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.career_goal import CareerGoal
from app.models.user import User
from app.schemas.career_goals import (
    CareerGoalCreate,
    CareerGoalResponse,
    CareerGoalUpdate,
)
from app.services.career_goals import (
    CareerGoalAlreadyExistsError,
    CareerGoalNotFoundError,
    RoleNotFoundError,
    create_career_goal,
    delete_career_goal,
    get_active_career_goal,
    update_career_goal,
)


router = APIRouter(prefix="/api/v1/career-goals", tags=["career-goals"])


def _response(goal: CareerGoal) -> CareerGoalResponse:
    return CareerGoalResponse(
        id=goal.id,
        target_role_id=goal.target_role_id,
        target_role=goal.role.title,
        experience_level=goal.experience_level,
        timeline=goal.target_duration or goal.duration,
        preferences=goal.description,
    )


@router.post("", response_model=CareerGoalResponse, status_code=status.HTTP_201_CREATED)
def create_goal(
    payload: CareerGoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerGoalResponse:
    try:
        return _response(create_career_goal(db, current_user.id, payload))
    except RoleNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CareerGoalAlreadyExistsError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/me", response_model=CareerGoalResponse)
def get_my_goal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerGoalResponse:
    goal = get_active_career_goal(db, current_user.id)
    if goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Career goal not found"
        )
    return _response(goal)


@router.put("/me", response_model=CareerGoalResponse)
def update_my_goal(
    payload: CareerGoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerGoalResponse:
    try:
        return _response(update_career_goal(db, current_user.id, payload))
    except RoleNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CareerGoalNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_goal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    try:
        delete_career_goal(db, current_user.id)
    except CareerGoalNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
