from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[int] = mapped_column(primary_key=True)

    career_goal_id: Mapped[int] = mapped_column(
        ForeignKey("career_goals.id"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    duration: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )


    steps: Mapped[list["RoadmapStep"]] = relationship(
        "RoadmapStep",
        back_populates="roadmap",
        cascade="all, delete-orphan"
    )
