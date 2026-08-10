from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.career_goal import CareerGoal
from app.models.progress import Progress
from app.models.roadmap import Roadmap
from app.models.roadmap_step import RoadmapStep
from app.schemas.progress import ProgressUpdate, RoadmapProgressResponse


class RoadmapStepNotFoundError(ValueError):
    pass


class RoadmapNotFoundError(ValueError):
    pass


def _owned_step(db: Session, user_id: int, step_id: int) -> RoadmapStep | None:
    return db.scalar(
        select(RoadmapStep)
        .join(RoadmapStep.roadmap)
        .join(Roadmap.career_goal)
        .where(RoadmapStep.id == step_id, CareerGoal.user_id == user_id)
        .options(selectinload(RoadmapStep.roadmap))
    )


def _progress_record(db: Session, user_id: int, step_id: int) -> Progress | None:
    return db.scalar(
        select(Progress)
        .where(Progress.user_id == user_id, Progress.step_id == step_id)
        .options(selectinload(Progress.step).selectinload(RoadmapStep.roadmap))
    )


def update_step_progress(
    db: Session, user_id: int, step_id: int, payload: ProgressUpdate
) -> Progress:
    step = _owned_step(db, user_id, step_id)
    if step is None:
        raise RoadmapStepNotFoundError("Roadmap step not found")

    progress = _progress_record(db, user_id, step_id)
    if progress is None:
        progress = Progress(user_id=user_id, step_id=step_id, status=payload.status)
        db.add(progress)
    else:
        progress.status = payload.status
    progress.completed_at = (
        datetime.now(timezone.utc) if payload.status == "completed" else None
    )
    db.commit()
    db.refresh(progress)
    saved_progress = _progress_record(db, user_id, step_id)
    if saved_progress is None:
        raise RoadmapStepNotFoundError("Roadmap step not found")
    return saved_progress


def list_user_progress(db: Session, user_id: int) -> list[Progress]:
    return list(
        db.scalars(
            select(Progress)
            .where(Progress.user_id == user_id)
            .options(
                selectinload(Progress.step).selectinload(RoadmapStep.roadmap)
            )
            .order_by(Progress.id)
        ).all()
    )


def get_roadmap_progress(
    db: Session, user_id: int, roadmap_id: int
) -> RoadmapProgressResponse:
    roadmap = db.scalar(
        select(Roadmap)
        .join(Roadmap.career_goal)
        .where(Roadmap.id == roadmap_id, CareerGoal.user_id == user_id)
        .options(selectinload(Roadmap.steps))
    )
    if roadmap is None:
        raise RoadmapNotFoundError("Roadmap not found")

    step_ids = [step.id for step in roadmap.steps]
    completed_steps = 0
    if step_ids:
        completed_steps = len(
            db.scalars(
                select(Progress).where(
                    Progress.user_id == user_id,
                    Progress.step_id.in_(step_ids),
                    Progress.status == "completed",
                )
            ).all()
        )
    total_steps = len(step_ids)
    return RoadmapProgressResponse(
        roadmap_id=roadmap.id,
        completed_steps=completed_steps,
        total_steps=total_steps,
        completion_percentage=(
            round(completed_steps / total_steps * 100, 2) if total_steps else 0.0
        ),
    )
