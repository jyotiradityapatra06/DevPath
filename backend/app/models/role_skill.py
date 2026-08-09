from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.role import Role
    from app.models.skill import Skill


class RoleSkill(Base):
    __tablename__ = "role_skills"
    __table_args__ = (
        CheckConstraint("importance BETWEEN 0 AND 100", name="ck_role_skills_importance"),
        UniqueConstraint("role_id", "skill_id", name="uq_role_skills_role_skill"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    importance: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    role: Mapped["Role"] = relationship("Role", back_populates="role_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="role_skills")
