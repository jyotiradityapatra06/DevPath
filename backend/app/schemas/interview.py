from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints


NonEmptyString = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class InterviewDifficulty(str, Enum):
    EASY = "Easy"
    MEDIUM = "Medium"
    HARD = "Hard"


class InterviewQuestion(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: NonEmptyString
    category: NonEmptyString
    difficulty: InterviewDifficulty
    evaluation_points: list[NonEmptyString]


class InterviewPreparationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_role: NonEmptyString
    preparation_summary: NonEmptyString
    questions: list[InterviewQuestion] = Field(min_length=1)
    focus_areas: list[NonEmptyString]
    confidence_score: int = Field(ge=0, le=100)
