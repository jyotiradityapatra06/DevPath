from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.roadmap import Roadmap
from app.models.user import User
from app.services.roadmap_generator import generate_roadmap, get_current_roadmap


router = APIRouter(prefix="/api/v1/roadmap", tags=["roadmap"])


class GenerateRoadmapRequest(BaseModel):
    role_id: int


class RoadmapStepResponse(BaseModel):
    id: int
    skill_id: int | None
    skill: str | None
    title: str
    description: str | None
    order: int
    week_number: int | None
    estimated_hours: int | None


class RoadmapResponse(BaseModel):
    id: int
    title: str
    role_id: int | None
    role: str | None
    duration: str | None
    steps: list[RoadmapStepResponse]


def _response(roadmap: Roadmap) -> RoadmapResponse:
    role = roadmap.career_goal.role
    return RoadmapResponse(
        id=roadmap.id,
        title=roadmap.title,
        role_id=roadmap.career_goal.target_role_id,
        role=role.title if role else None,
        duration=roadmap.duration,
        steps=[
            RoadmapStepResponse(
                id=step.id,
                skill_id=step.skill_id,
                skill=step.skill.name if step.skill else None,
                title=step.title,
                description=step.description,
                order=step.order,
                week_number=step.week_number,
                estimated_hours=step.estimated_hours,
            )
            for step in sorted(roadmap.steps, key=lambda item: item.order)
        ],
    )


@router.post("/generate", response_model=RoadmapResponse, status_code=status.HTTP_201_CREATED)
def create_roadmap(
    payload: GenerateRoadmapRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapResponse:
    try:
        roadmap = generate_roadmap(user.id, payload.role_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return _response(roadmap)


@router.get("/current", response_model=RoadmapResponse)
def current_roadmap(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> RoadmapResponse:
    roadmap = get_current_roadmap(user.id, db)
    if roadmap is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No roadmap found")
    return _response(roadmap)
