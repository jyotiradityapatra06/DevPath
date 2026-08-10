from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.dependencies import get_ai_provider
from app.auth.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import User
from app.schemas.coach import CoachChatRequest, CoachChatResponse
from app.services.ai_career_coach import (
    CareerCoachProviderError,
    generate_career_coach_response,
)
from app.services.conversation import ConversationNotFoundError


router = APIRouter(prefix="/api/v1/coach", tags=["coach"])


@router.post("/chat", response_model=CoachChatResponse)
def coach_chat(
    payload: CoachChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    provider: AIProvider = Depends(get_ai_provider),
) -> CoachChatResponse:
    try:
        result = generate_career_coach_response(
            db,
            current_user.id,
            payload.conversation_id,
            payload.message,
            provider,
        )
    except ConversationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except CareerCoachProviderError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI provider failed to generate a response",
        ) from exc
    return CoachChatResponse(
        conversation_id=result.conversation_id,
        response=result.content,
    )
