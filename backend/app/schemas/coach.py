from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class CoachChatRequest(BaseModel):
    conversation_id: int = Field(gt=0)
    message: str = Field(min_length=1)


class CoachInsight(BaseModel):
    title: str
    description: str
    priority: Literal["High", "Recommended", "Strategic"]


class SuggestedAction(BaseModel):
    label: str
    action: str


class CoachChatResponse(BaseModel):
    conversation_id: int
    response: str
    timestamp: datetime
    insights: list[CoachInsight]
    suggested_actions: list[SuggestedAction]
