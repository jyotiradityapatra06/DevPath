from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, StringConstraints, field_validator


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

    @field_validator("difficulty", mode="before")
    @classmethod
    def normalize_difficulty(cls, value: object) -> str:
        val = str(value).strip().lower()
        if val in {"advanced", "hard", "expert"}:
            return InterviewDifficulty.HARD.value
        elif val in {"intermediate", "medium"}:
            return InterviewDifficulty.MEDIUM.value
        return InterviewDifficulty.EASY.value


class InterviewPreparationResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_role: NonEmptyString
    preparation_summary: NonEmptyString
    questions: list[InterviewQuestion] = Field(min_length=1)
    focus_areas: list[NonEmptyString]
    confidence_score: int = Field(ge=0, le=100)

    @field_validator("confidence_score", mode="before")
    @classmethod
    def normalize_confidence(cls, value: object) -> int:
        if isinstance(value, (int, float)):
            if value <= 1.0 and value > 0:
                return int(round(value * 100))
            return int(round(value))
        return int(round(float(str(value))))
