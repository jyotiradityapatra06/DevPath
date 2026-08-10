from pydantic import BaseModel, Field


class CoachChatRequest(BaseModel):
    conversation_id: int = Field(gt=0)
    message: str = Field(min_length=1)


class CoachChatResponse(BaseModel):
    conversation_id: int
    response: str
