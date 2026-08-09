from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class RecommendationBase(BaseModel):
    recommendation_type: str = Field(max_length=50)
    title: str = Field(max_length=255)
    description: str
    reason: str
    priority_score: float = Field(ge=0, le=100)
    priority_level: Literal["LOW", "MEDIUM", "HIGH"]


class RecommendationCreate(RecommendationBase):
    pass


class RecommendationResponse(RecommendationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
