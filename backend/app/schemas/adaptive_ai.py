from enum import Enum

from pydantic import BaseModel, Field


class PriorityLevel(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class RoadmapChange(BaseModel):
    action: str
    item: str
    reason: str


class RoadmapOptimizationResponse(BaseModel):
    roadmap_status: str

    completed_strengths: list[str]

    recommended_changes: list[RoadmapChange]

    next_focus: list[str]

    confidence_score: int = Field(
        ge=0,
        le=100,
    )