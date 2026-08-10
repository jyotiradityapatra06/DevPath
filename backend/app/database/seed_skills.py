from typing import TypedDict

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.connection import SessionLocal
from app.models.role import Role
from app.models.role_skill import RoleSkill
from app.models.skill import Skill


SkillSeed = tuple[str, str, int]


class RoleSeed(TypedDict):
    description: str
    skills: dict[str, SkillSeed]


ROLE_DATA: dict[str, RoleSeed] = {
    "Software Engineer": {
        "description": "Designs and builds maintainable software systems.",
        "skills": {
            "Python": ("Programming Language", "Intermediate", 85),
            "JavaScript": ("Programming Language", "Intermediate", 85),
            "Git": ("Developer Tool", "Intermediate", 80),
            "Data Structures": ("Computer Science", "Intermediate", 90),
            "System Design": ("Software Architecture", "Advanced", 80),
        },
    },
    "Backend Developer": {
        "description": "Builds reliable server-side applications, APIs, and data services.",
        "skills": {
            "Python": ("Programming Language", "Intermediate", 95),
            "FastAPI": ("Backend Framework", "Advanced", 90),
            "PostgreSQL": ("Database", "Intermediate", 85),
            "Docker": ("DevOps", "Intermediate", 75),
            "Git": ("Developer Tool", "Intermediate", 80),
            "Linux": ("Operating System", "Intermediate", 75),
            "REST APIs": ("API Design", "Intermediate", 90),
            "System Design": ("Software Architecture", "Advanced", 90),
        },
    },
    "Full Stack Developer": {
        "description": "Develops user interfaces and the services that power them.",
        "skills": {
            "HTML": ("Frontend", "Beginner", 85),
            "CSS": ("Frontend", "Intermediate", 80),
            "JavaScript": ("Programming Language", "Intermediate", 95),
            "React": ("Frontend Framework", "Advanced", 90),
            "Node.js": ("Backend Runtime", "Intermediate", 85),
            "SQL": ("Database", "Intermediate", 80),
            "Git": ("Developer Tool", "Intermediate", 75),
        },
    },
    "AI Engineer": {
        "description": "Designs, trains, evaluates, and deploys intelligent systems.",
        "skills": {
            "Python": ("Programming Language", "Intermediate", 95),
            "Machine Learning": ("Artificial Intelligence", "Advanced", 95),
            "Deep Learning": ("Artificial Intelligence", "Advanced", 90),
            "PyTorch": ("ML Framework", "Advanced", 85),
            "Data Processing": ("Data Engineering", "Intermediate", 80),
            "MLOps": ("DevOps", "Advanced", 80),
        },
    },
    "Cloud Engineer": {
        "description": "Builds reliable cloud infrastructure and deployment systems.",
        "skills": {
            "AWS": ("Cloud Platform", "Intermediate", 95),
            "Docker": ("DevOps", "Intermediate", 90),
            "Kubernetes": ("DevOps", "Advanced", 90),
            "Linux": ("Operating System", "Intermediate", 85),
            "Git": ("Developer Tool", "Intermediate", 75),
        },
    },
    "Data Scientist": {
        "description": "Uses statistics and computation to turn data into decisions.",
        "skills": {
            "Python": ("Programming Language", "Intermediate", 90),
            "Statistics": ("Mathematics", "Advanced", 95),
            "Pandas": ("Data Library", "Intermediate", 90),
            "NumPy": ("Data Library", "Intermediate", 85),
            "Machine Learning": ("Artificial Intelligence", "Advanced", 90),
            "Data Visualization": ("Data Analysis", "Intermediate", 85),
        },
    },
}

ADDITIONAL_SKILLS: dict[str, SkillSeed] = {
    "TypeScript": ("Programming Language", "Intermediate", 70),
    "Next.js": ("Frontend Framework", "Intermediate", 70),
    "Django": ("Backend Framework", "Intermediate", 70),
    "MongoDB": ("Database", "Intermediate", 70),
    "TensorFlow": ("ML Framework", "Advanced", 70),
}


def seed_skill_intelligence(db: Session) -> None:
    skills = {skill.name: skill for skill in db.scalars(select(Skill)).all()}
    roles = {role.title: role for role in db.scalars(select(Role)).all()}

    for name, values in ADDITIONAL_SKILLS.items():
        if name not in skills:
            category, difficulty, _ = values
            skill = Skill(name=name, category=category, difficulty=difficulty)
            db.add(skill)
            db.flush()
            skills[name] = skill

    for title, role_data in ROLE_DATA.items():
        role = roles.get(title)
        if role is None:
            role = Role(title=title, description=str(role_data["description"]))
            db.add(role)
            db.flush()
            roles[title] = role

        for name, values in role_data["skills"].items():
            category, difficulty, importance = values
            skill = skills.get(name)
            if skill is None:
                skill = Skill(name=name, category=category, difficulty=difficulty)
                db.add(skill)
                db.flush()
                skills[name] = skill
            elif skill.difficulty is None:
                skill.difficulty = difficulty

            mapping = db.scalar(
                select(RoleSkill).where(
                    RoleSkill.role_id == role.id, RoleSkill.skill_id == skill.id
                )
            )
            if mapping is None:
                db.add(RoleSkill(role=role, skill=skill, importance=importance))
            else:
                mapping.importance = importance
    db.commit()


if __name__ == "__main__":
    with SessionLocal() as session:
        seed_skill_intelligence(session)
