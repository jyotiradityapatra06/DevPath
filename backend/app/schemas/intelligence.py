from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CareerAnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    focus: str | None = Field(default=None, min_length=1, max_length=500)


class CareerStrength(BaseModel):
    model_config = ConfigDict(extra="forbid")

    area: str
    explanation: str


class SkillPriority(BaseModel):
    model_config = ConfigDict(extra="forbid")

    skill: str
    priority: Literal["High", "Medium", "Low"]
    reason: str


class CareerAnalysisResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    career_stage: str
    readiness_score: int = Field(ge=0, le=100)
    strengths: list[CareerStrength]
    weaknesses: list[str]
    skill_priorities: list[SkillPriority]
    next_actions: list[str]
