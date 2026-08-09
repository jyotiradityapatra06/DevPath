from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base

if TYPE_CHECKING:
    from app.models.roadmap_step import RoadmapStep


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True)

    career_goal_id: Mapped[int] = mapped_column(
        ForeignKey("career_goals.id"),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    duration: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    steps: Mapped[list["RoadmapStep"]] = relationship(
        "RoadmapStep",
        back_populates="roadmap",
        cascade="all, delete-orphan",
    )