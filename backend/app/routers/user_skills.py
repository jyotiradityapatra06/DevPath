from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.models.user_skill import UserSkill
from app.schemas.user_skills import (
    UserSkillCreate,
    UserSkillResponse,
    UserSkillUpdate,
    normalize_skill_level,
    normalize_skill_status,
)
from app.services.user_skills import (
    DuplicateUserSkillError,
    SkillNotFoundError,
    UserSkillNotFoundError,
    add_user_skill,
    delete_user_skill,
    list_user_skills,
    update_user_skill,
)


router = APIRouter(prefix="/api/v1/user-skills", tags=["user-skills"])


def _response(user_skill: UserSkill) -> UserSkillResponse:
    return UserSkillResponse(
        id=user_skill.id,
        skill_id=user_skill.skill_id,
        skill=user_skill.skill.name,
        level=normalize_skill_level(user_skill.level),
        status=normalize_skill_status(user_skill.status),
    )


@router.post("", response_model=UserSkillResponse, status_code=status.HTTP_201_CREATED)
def create_user_skill(
    payload: UserSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserSkillResponse:
    try:
        return _response(add_user_skill(db, current_user.id, payload))
    except SkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DuplicateUserSkillError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("", response_model=list[UserSkillResponse])
def get_user_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserSkillResponse]:
    return [_response(item) for item in list_user_skills(db, current_user.id)]


@router.put("/{skill_id}", response_model=UserSkillResponse)
def modify_user_skill(
    skill_id: int,
    payload: UserSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserSkillResponse:
    try:
        return _response(update_user_skill(db, current_user.id, skill_id, payload))
    except UserSkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_skill(
    skill_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    try:
        delete_user_skill(db, current_user.id, skill_id)
    except UserSkillNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)
