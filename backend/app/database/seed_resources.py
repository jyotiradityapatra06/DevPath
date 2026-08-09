from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.learning_resource import LearningResource
from app.models.skill import Skill


class ResourceSeed(TypedDict):
    title: str
    provider: str
    resource_type: str
    url: str
    difficulty: str
    rating: float


RESOURCE_DATA: dict[str, list[ResourceSeed]] = {
    "Python": [
        {"title": "Official Python Documentation", "provider": "Python Software Foundation", "resource_type": "Documentation", "url": "https://docs.python.org/3/", "difficulty": "Intermediate", "rating": 5.0},
        {"title": "Automate The Boring Stuff", "provider": "Al Sweigart", "resource_type": "Course", "url": "https://automatetheboringstuff.com/", "difficulty": "Beginner", "rating": 4.8},
        {"title": "Python Projects", "provider": "Real Python", "resource_type": "Project", "url": "https://realpython.com/tutorials/projects/", "difficulty": "Intermediate", "rating": 4.7},
    ],
    "FastAPI": [
        {"title": "FastAPI Documentation", "provider": "FastAPI", "resource_type": "Documentation", "url": "https://fastapi.tiangolo.com/", "difficulty": "Intermediate", "rating": 5.0},
        {"title": "FastAPI Full Course", "provider": "freeCodeCamp", "resource_type": "Video", "url": "https://www.youtube.com/watch?v=0sOvCWFmrtA", "difficulty": "Intermediate", "rating": 4.8},
    ],
    "PostgreSQL": [
        {"title": "PostgreSQL Documentation", "provider": "PostgreSQL Global Development Group", "resource_type": "Documentation", "url": "https://www.postgresql.org/docs/", "difficulty": "Intermediate", "rating": 5.0},
    ],
    "React": [
        {"title": "React Documentation", "provider": "React", "resource_type": "Documentation", "url": "https://react.dev/learn", "difficulty": "Intermediate", "rating": 5.0},
    ],
    "Machine Learning": [
        {"title": "Scikit Learn Documentation", "provider": "scikit-learn", "resource_type": "Documentation", "url": "https://scikit-learn.org/stable/user_guide.html", "difficulty": "Intermediate", "rating": 4.9},
        {"title": "ML Projects", "provider": "Kaggle", "resource_type": "Project", "url": "https://www.kaggle.com/learn", "difficulty": "Intermediate", "rating": 4.8},
    ],
}


def seed_learning_resources(db: Session) -> None:
    skills = {
        skill.name: skill
        for skill in db.scalars(select(Skill).where(Skill.name.in_(RESOURCE_DATA))).all()
    }
    existing = {
        (resource.skill_id, resource.title, resource.url)
        for resource in db.scalars(select(LearningResource)).all()
    }
    for skill_name, resources in RESOURCE_DATA.items():
        skill = skills.get(skill_name)
        if skill is None:
            continue
        for resource_data in resources:
            key = (skill.id, resource_data["title"], resource_data["url"])
            if key not in existing:
                db.add(LearningResource(skill=skill, **resource_data))
                existing.add(key)
    db.commit()


if __name__ == "__main__":
    with SessionLocal() as session:
        seed_learning_resources(session)
