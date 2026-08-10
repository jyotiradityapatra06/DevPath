from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import exists, select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.security import create_access_token, hash_password, verify_password
from app.database.connection import get_db
from app.models.user import User
from app.models.career_goal import CareerGoal
from app.models.profile import Profile
from app.models.user_skill import UserSkill
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=UserResponse)
def current_user(user: User = Depends(get_current_user)) -> User:
    return user


@router.post("/onboarding/complete", response_model=UserResponse)
def complete_onboarding(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    has_profile = db.scalar(select(exists().where(Profile.user_id == user.id)))
    has_goal = db.scalar(select(exists().where(CareerGoal.user_id == user.id)))
    has_skills = db.scalar(select(exists().where(UserSkill.user_id == user.id)))
    if not all((has_profile, has_goal, has_skills)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Onboarding data is incomplete",
        )
    user.onboarding_completed = True
    db.commit()
    db.refresh(user)
    return user


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    email = str(payload.email).lower()
    if db.scalar(select(User).where(User.email == email)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(name=payload.name.strip(), email=email, password_hash=hash_password(payload.password))
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from exc
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to create user",
        ) from exc
    return user


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenResponse(access_token=create_access_token({"sub": str(user.id)}))
