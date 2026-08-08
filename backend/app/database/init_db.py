from app.database.connection import Base, engine
from app.models.user import User  # noqa: F401 - registers model metadata


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
