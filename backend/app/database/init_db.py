from app.database.connection import Base, engine
from app.models import (  # noqa: F401 - registers model metadata
    CareerGoal,
    Profile,
    Progress,
    Roadmap,
    RoadmapStep,
    Skill,
    User,
    UserSkill,
)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
