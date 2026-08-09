from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserProfileBase(BaseModel):
    education: str | None = Field(default=None, max_length=255)
    degree: str | None = Field(default=None, max_length=255)
    graduation_year: int | None = Field(default=None, ge=1900, le=2200)
    experience_level: str | None = Field(default=None, max_length=100)
    preferred_domain: str | None = Field(default=None, max_length=100)
    learning_style: str | None = Field(default=None, max_length=100)
    weekly_learning_hours: int | None = Field(default=None, ge=1, le=168)
    target_timeline: str | None = Field(default=None, max_length=100)


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    education: str | None = Field(default=None, max_length=255)
    degree: str | None = Field(default=None, max_length=255)
    graduation_year: int | None = Field(default=None, ge=1900, le=2200)
    experience_level: str | None = Field(default=None, max_length=100)
    preferred_domain: str | None = Field(default=None, max_length=100)
    learning_style: str | None = Field(default=None, max_length=100)
    weekly_learning_hours: int | None = Field(default=None, ge=1, le=168)
    target_timeline: str | None = Field(default=None, max_length=100)


class UserProfileResponse(UserProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    updated_at: datetime
