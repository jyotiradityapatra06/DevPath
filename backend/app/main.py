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
from app.routers.dashboard import router as dashboard_router
from app.routers.user_skills import router as user_skills_router
from app.routers.progress import router as progress_router
from app.routers.conversations import router as conversations_router
from app.routers.coach import router as coach_router
from app.routers.intelligence import router as intelligence_router


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
app.include_router(dashboard_router)
app.include_router(user_skills_router)
app.include_router(progress_router)
app.include_router(conversations_router)
app.include_router(coach_router)
app.include_router(intelligence_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "DevPath API running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy", "service": "DevPath API"}
