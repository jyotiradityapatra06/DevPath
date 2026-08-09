from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.career_goal import CareerGoal
    from app.models.role_skill import RoleSkill
    from app.models.skill_gap import SkillGap


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    role_skills: Mapped[list["RoleSkill"]] = relationship(
        "RoleSkill", back_populates="role", cascade="all, delete-orphan"
    )
    career_goals: Mapped[list["CareerGoal"]] = relationship(
        "CareerGoal", back_populates="role"
    )
    skill_gaps: Mapped[list["SkillGap"]] = relationship(
        "SkillGap", back_populates="role", cascade="all, delete-orphan"
    )
