from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


NonEmptyString = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class PriorityLevel(str, Enum):
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class WeeklyTask(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: NonEmptyString
    description: NonEmptyString
    estimated_hours: float = Field(gt=0)
    priority: PriorityLevel
    skill_focus: NonEmptyString


class WeeklyLearningPlanResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    week_number: int = Field(ge=1)
    focus_area: NonEmptyString
    summary: NonEmptyString
    tasks: list[WeeklyTask] = Field(min_length=1)
    expected_outcomes: list[NonEmptyString]
    confidence_score: int = Field(ge=0, le=100)
