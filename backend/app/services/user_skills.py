from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.skill import Skill
from app.models.user_skill import UserSkill
from app.schemas.user_skills import UserSkillCreate, UserSkillUpdate
from app.services.intelligence_state import invalidate_user_intelligence


class SkillNotFoundError(ValueError):
    pass


class UserSkillNotFoundError(ValueError):
    pass


class DuplicateUserSkillError(ValueError):
    pass


def _user_skill_query(user_id: int, skill_id: int) -> Select[tuple[UserSkill]]:
    return (
        select(UserSkill)
        .where(UserSkill.user_id == user_id, UserSkill.skill_id == skill_id)
        .options(selectinload(UserSkill.skill))
    )


def add_user_skill(
    db: Session, user_id: int, payload: UserSkillCreate
) -> UserSkill:
    if db.get(Skill, payload.skill_id) is None:
        raise SkillNotFoundError("Skill not found")
    if db.scalar(_user_skill_query(user_id, payload.skill_id)) is not None:
        raise DuplicateUserSkillError("Skill already added")

    user_skill = UserSkill(
        user_id=user_id,
        skill_id=payload.skill_id,
        level=payload.level.value,
        status=payload.status.value,
    )
    db.add(user_skill)
    invalidate_user_intelligence(db, user_id)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateUserSkillError("Skill already added") from exc
    db.refresh(user_skill)
    saved_user_skill = db.scalar(_user_skill_query(user_id, payload.skill_id))
    if saved_user_skill is None:
        raise UserSkillNotFoundError("User skill not found")
    return saved_user_skill


def list_user_skills(db: Session, user_id: int) -> list[UserSkill]:
    return list(
        db.scalars(
            select(UserSkill)
            .where(UserSkill.user_id == user_id)
            .options(selectinload(UserSkill.skill))
            .order_by(UserSkill.id)
        ).all()
    )


def update_user_skill(
    db: Session, user_id: int, skill_id: int, payload: UserSkillUpdate
) -> UserSkill:
    user_skill = db.scalar(_user_skill_query(user_id, skill_id))
    if user_skill is None:
        raise UserSkillNotFoundError("User skill not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user_skill, field, value.value if value is not None else value)
    invalidate_user_intelligence(db, user_id)
    db.commit()
    db.refresh(user_skill)
    return user_skill


def delete_user_skill(db: Session, user_id: int, skill_id: int) -> None:
    user_skill = db.scalar(_user_skill_query(user_id, skill_id))
    if user_skill is None:
        raise UserSkillNotFoundError("User skill not found")
    db.delete(user_skill)
    invalidate_user_intelligence(db, user_id)
    db.commit()
