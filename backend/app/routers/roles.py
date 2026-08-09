from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.database.connection import get_db
from app.models.role import Role
from app.models.role_skill import RoleSkill


router = APIRouter(prefix="/api/v1/roles", tags=["roles"])


class RoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    created_at: datetime


class RequiredSkillResponse(BaseModel):
    name: str
    importance: int
    difficulty: str | None


class RoleSkillsResponse(BaseModel):
    role: str
    skills: list[RequiredSkillResponse]


@router.get("", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db)) -> list[Role]:
    return list(db.scalars(select(Role).order_by(Role.title)).all())


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db)) -> Role:
    role = db.get(Role, role_id)
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    return role


@router.get("/{role_id}/skills", response_model=RoleSkillsResponse)
def get_role_skills(role_id: int, db: Session = Depends(get_db)) -> RoleSkillsResponse:
    role = db.scalar(
        select(Role)
        .where(Role.id == role_id)
        .options(selectinload(Role.role_skills).selectinload(RoleSkill.skill))
    )
    if role is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Role not found")
    mappings = sorted(role.role_skills, key=lambda item: (-item.importance, item.skill.name))
    return RoleSkillsResponse(
        role=role.title,
        skills=[
            RequiredSkillResponse(
                name=mapping.skill.name,
                importance=mapping.importance,
                difficulty=mapping.skill.difficulty,
            )
            for mapping in mappings
        ],
    )
