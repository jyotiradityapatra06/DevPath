from typing import Any

from pydantic import BaseModel, Field


class AIRequest(BaseModel):
    prompt: str = Field(min_length=1)
    context: dict[str, Any] = Field(default_factory=dict)


class AIResponse(BaseModel):
    content: str
    provider: str | None = None
    model: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class CoachRequest(BaseModel):
    conversation_id: int = Field(gt=0)
    message: str = Field(min_length=1)


class CoachResponse(BaseModel):
    conversation_id: int
    message_id: int
    content: str
