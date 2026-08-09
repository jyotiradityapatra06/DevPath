from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.roadmap_step import RoadmapStep


class Progress(Base):
    __tablename__ = "progress"

    __table_args__ = (
        CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed')",
            name="ck_progress_status",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    step_id: Mapped[int] = mapped_column(
        ForeignKey("roadmap_steps.id"),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="progress",
    )

    step: Mapped["RoadmapStep"] = relationship(
        "RoadmapStep",
        back_populates="progress",
    )