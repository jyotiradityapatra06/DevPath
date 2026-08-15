from enum import Enum

from pydantic import BaseModel, Field, field_validator


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

    @field_validator("confidence_score", mode="before")
    @classmethod
    def normalize_confidence(cls, value: object) -> int:
        if isinstance(value, (int, float)):
            if value <= 1.0 and value > 0:
                return int(round(value * 100))
            return int(round(value))
        return int(round(float(str(value))))