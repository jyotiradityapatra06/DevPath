from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id: Mapped[int] = mapped_column(primary_key=True)

    roadmap_id: Mapped[int] = mapped_column(
        ForeignKey("roadmaps.id"),
        nullable=False
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    order: Mapped[int] = mapped_column(
        nullable=False
    )


    roadmap: Mapped["Roadmap"] = relationship(
        "Roadmap",
        back_populates="steps"
    )

    progress: Mapped[list["Progress"]] = relationship(
        "Progress",
        back_populates="step",
        cascade="all, delete-orphan"
    )
