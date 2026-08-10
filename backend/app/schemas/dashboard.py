from pydantic import BaseModel, ConfigDict


class CareerProfile(BaseModel):
    target_role: str
    experience_level: str
    readiness_score: float


class SkillOverview(BaseModel):
    total_skills: int
    completed: int
    in_progress: int
    missing: int


class Strength(BaseModel):
    skill: str
    level: str


class SkillGapItem(BaseModel):
    skill: str
    priority: str


class RoadmapProgress(BaseModel):
    current_phase: int | None
    completion_percentage: float
    completed_steps: int
    total_steps: int


class DashboardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    career_profile: CareerProfile
    skill_overview: SkillOverview
    strengths: list[Strength]
    skill_gaps: list[SkillGapItem]
    roadmap_progress: RoadmapProgress
    ai_recommendations: list[str]
