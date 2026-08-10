from typing import Self

from pydantic import BaseModel, Field, model_validator


class CareerGoalCreate(BaseModel):
    target_role_id: int = Field(gt=0)
    experience_level: str | None = Field(default=None, max_length=50)
    timeline: str | None = Field(default=None, max_length=50)
    preferences: str | None = None


class CareerGoalUpdate(BaseModel):
    target_role_id: int | None = Field(default=None, gt=0)
    experience_level: str | None = Field(default=None, max_length=50)
    timeline: str | None = Field(default=None, max_length=50)
    preferences: str | None = None

    @model_validator(mode="after")
    def require_update_value(self) -> Self:
        if not self.model_fields_set:
            raise ValueError("At least one field is required")
        if "target_role_id" in self.model_fields_set and self.target_role_id is None:
            raise ValueError("Target role cannot be null")
        return self


class CareerGoalResponse(BaseModel):
    id: int
    target_role_id: int
    target_role: str
    experience_level: str | None
    timeline: str | None
    preferences: str | None
