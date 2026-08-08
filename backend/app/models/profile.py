from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    bio: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True
    )

    education: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    experience_level: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )


    user = relationship(
        "User",
        back_populates="profile"
    )