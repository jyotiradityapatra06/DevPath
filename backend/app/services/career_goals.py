from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.career_goal import CareerGoal
from app.models.role import Role
from app.schemas.career_goals import CareerGoalCreate, CareerGoalUpdate
from app.services.intelligence_state import invalidate_user_intelligence


class RoleNotFoundError(ValueError):
    pass


class CareerGoalNotFoundError(ValueError):
    pass


class CareerGoalAlreadyExistsError(ValueError):
    pass


def get_active_career_goal(db: Session, user_id: int) -> CareerGoal | None:
    return db.scalar(
        select(CareerGoal)
        .where(
            CareerGoal.user_id == user_id,
            CareerGoal.target_role_id.is_not(None),
        )
        .options(selectinload(CareerGoal.role))
        .order_by(CareerGoal.id.desc())
        .limit(1)
    )


def create_career_goal(
    db: Session, user_id: int, payload: CareerGoalCreate
) -> CareerGoal:
    if get_active_career_goal(db, user_id) is not None:
        raise CareerGoalAlreadyExistsError("Career goal already exists")
    role = db.get(Role, payload.target_role_id)
    if role is None:
        raise RoleNotFoundError("Role not found")

    goal = CareerGoal(
        name=f"{role.title} goal for user {user_id}",
        user_id=user_id,
        target_role_id=role.id,
        experience_level=payload.experience_level,
        target_duration=payload.timeline,
        description=payload.preferences,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    saved_goal = get_active_career_goal(db, user_id)
    if saved_goal is None:
        raise CareerGoalNotFoundError("Career goal not found")
    return saved_goal


def update_career_goal(
    db: Session, user_id: int, payload: CareerGoalUpdate
) -> CareerGoal:
    goal = get_active_career_goal(db, user_id)
    if goal is None:
        raise CareerGoalNotFoundError("Career goal not found")
    if payload.target_role_id is not None:
        role = db.get(Role, payload.target_role_id)
        if role is None:
            raise RoleNotFoundError("Role not found")
        if goal.target_role_id != role.id:
            invalidate_user_intelligence(db, user_id, goal.id)
            goal.target_role_id = role.id
    if "experience_level" in payload.model_fields_set:
        goal.experience_level = payload.experience_level
    if "timeline" in payload.model_fields_set:
        goal.target_duration = payload.timeline
    if "preferences" in payload.model_fields_set:
        goal.description = payload.preferences
    db.commit()
    db.refresh(goal)
    updated_goal = get_active_career_goal(db, user_id)
    if updated_goal is None:
        raise CareerGoalNotFoundError("Career goal not found")
    return updated_goal


def delete_career_goal(db: Session, user_id: int) -> None:
    goal = get_active_career_goal(db, user_id)
    if goal is None:
        raise CareerGoalNotFoundError("Career goal not found")
    db.delete(goal)
    db.commit()
