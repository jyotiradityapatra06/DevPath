from enum import StrEnum
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class SkillStatus(StrEnum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    MASTERED = "MASTERED"


class SkillLevel(StrEnum):
    BEGINNER = "BEGINNER"
    INTERMEDIATE = "INTERMEDIATE"
    ADVANCED = "ADVANCED"
    EXPERT = "EXPERT"


def normalize_skill_status(value: str | SkillStatus) -> SkillStatus:
    normalized = str(value).strip().upper().replace(" ", "_")
    if normalized == "ACTIVE":
        normalized = SkillStatus.IN_PROGRESS.value
    return SkillStatus(normalized)


def normalize_skill_level(value: str | SkillLevel) -> SkillLevel:
    return SkillLevel(str(value).strip().upper())


class UserSkillCreate(BaseModel):
    skill_id: int = Field(gt=0)
    level: SkillLevel
    status: SkillStatus

    @field_validator("level", mode="before")
    @classmethod
    def validate_level(cls, value: object) -> SkillLevel:
        return normalize_skill_level(str(value))

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value: object) -> SkillStatus:
        return normalize_skill_status(str(value))


class UserSkillUpdate(BaseModel):
    level: SkillLevel | None = None
    status: SkillStatus | None = None

    @field_validator("level", mode="before")
    @classmethod
    def validate_level(cls, value: object) -> SkillLevel | None:
        return None if value is None else normalize_skill_level(str(value))

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value: object) -> SkillStatus | None:
        return None if value is None else normalize_skill_status(str(value))

    @model_validator(mode="after")
    def require_update_value(self) -> Self:
        if not self.model_fields_set or any(
            getattr(self, field) is None for field in self.model_fields_set
        ):
            raise ValueError("At least one non-null field is required")
        return self


class UserSkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    skill_id: int
    skill: str
    level: SkillLevel
    status: SkillStatus
