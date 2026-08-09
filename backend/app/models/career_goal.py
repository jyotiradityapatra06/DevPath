from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship, synonym

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.roadmap import Roadmap
    from app.models.user import User


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    duration: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    target_role_id: Mapped[int | None] = mapped_column(
        ForeignKey("roles.id"), nullable=True, index=True
    )
    role_id = synonym("target_role_id")
    role: Mapped["Role | None"] = relationship(
        "Role", back_populates="career_goals"
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), nullable=True, index=True
    )
    user: Mapped["User | None"] = relationship(
        "User", back_populates="career_goals"
    )
    experience_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_duration: Mapped[str | None] = mapped_column(String(50), nullable=True)
    roadmaps: Mapped[list["Roadmap"]] = relationship(
        "Roadmap", back_populates="career_goal", cascade="all, delete-orphan"
    )
