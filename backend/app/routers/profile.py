from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.profile import (
    UserProfileCreate,
    UserProfileResponse,
    UserProfileUpdate,
)
from app.services.profile import (
    create_profile,
    get_profile,
    update_profile,
)


router = APIRouter(
    prefix="/api/v1/profile",
    tags=["profile"],
)


@router.post(
    "",
    response_model=UserProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user_profile(
    profile_data: UserProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_profile = get_profile(
        db,
        current_user.id,
    )

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists",
        )

    return create_profile(
        db,
        current_user.id,
        profile_data,
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = get_profile(
        db,
        current_user.id,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return profile


@router.put(
    "/me",
    response_model=UserProfileResponse,
)
def update_my_profile(
    profile_data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = update_profile(
        db,
        current_user.id,
        profile_data,
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found",
        )

    return profile