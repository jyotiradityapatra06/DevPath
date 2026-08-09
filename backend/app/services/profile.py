from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import UserProfileCreate, UserProfileUpdate


def get_profile(db: Session, user_id: int) -> Profile | None:
    return db.scalar(select(Profile).where(Profile.user_id == user_id))


def create_profile(
    db: Session, user_id: int, payload: UserProfileCreate
) -> Profile:
    user = db.get(User, user_id)
    if user is None:
        raise ValueError("User not found")
    profile = Profile(
        user_id=user_id,
        full_name=user.name,
        **payload.model_dump(),
    )
    db.add(profile)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(profile)
    return profile


def update_profile(
    db: Session, user_id: int, payload: UserProfileUpdate
) -> Profile | None:
    profile = get_profile(db, user_id)
    if profile is None:
        return None
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
