from fastapi import FastAPI

from app.routers.auth import router as auth_router
from app.routers.career_goals import router as career_goals_router
from app.routers.profile import router as profile_router
from app.routers.roadmap import router as roadmap_router
from app.routers.roles import router as roles_router
from app.routers.skills import router as skills_router
from app.routers.skill_gap import router as skill_gap_router
from app.routers.resources import router as resources_router
from app.routers.personalization import router as personalization_router


app = FastAPI(title="DevPath API", version="0.1.0")
app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(career_goals_router)
app.include_router(skills_router)
app.include_router(roadmap_router)
app.include_router(roles_router)
app.include_router(skill_gap_router)
app.include_router(resources_router)
app.include_router(personalization_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "DevPath API running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "DevPath API"}
