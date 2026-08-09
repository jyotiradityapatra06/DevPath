from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.learning_resource import LearningResource
    from app.models.roadmap_step import RoadmapStep
    from app.models.role_skill import RoleSkill
    from app.models.user_skill import UserSkill


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    difficulty: Mapped[str | None] = mapped_column(String(50), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user_skills: Mapped[list["UserSkill"]] = relationship(
        "UserSkill", back_populates="skill"
    )
    role_skills: Mapped[list["RoleSkill"]] = relationship(
        "RoleSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    resources: Mapped[list["LearningResource"]] = relationship(
        "LearningResource", back_populates="skill", cascade="all, delete-orphan"
    )
    roadmap_steps: Mapped[list["RoadmapStep"]] = relationship(
        "RoadmapStep", back_populates="skill"
    )
