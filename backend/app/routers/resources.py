from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.connection import get_db
from app.models.skill import Skill


router = APIRouter(prefix="/api/v1/skills", tags=["resources"])


class ResourceResponse(BaseModel):
    title: str
    provider: str
    type: str
    difficulty: str
    rating: float


class SkillResourcesResponse(BaseModel):
    skill: str
    resources: list[ResourceResponse]


@router.get("/{skill_id}/resources", response_model=SkillResourcesResponse)
def get_skill_resources(
    skill_id: int, db: Session = Depends(get_db)
) -> SkillResourcesResponse:
    skill = db.scalar(
        select(Skill).where(Skill.id == skill_id).options(selectinload(Skill.resources))
    )
    if skill is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Skill not found")
    return SkillResourcesResponse(
        skill=skill.name,
        resources=[
            ResourceResponse(
                title=resource.title,
                provider=resource.provider,
                type=resource.resource_type,
                difficulty=resource.difficulty,
                rating=resource.rating,
            )
            for resource in sorted(skill.resources, key=lambda item: (-item.rating, item.title))
        ],
    )
