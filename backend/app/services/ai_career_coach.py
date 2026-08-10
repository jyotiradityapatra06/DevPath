import json

from sqlalchemy.orm import Session

from app.ai.base import AIProvider
from app.ai.prompts.career_coach import (
    CAREER_COACH_PROMPT,
    CAREER_COACH_SYSTEM_PROMPT,
)
from app.ai.schemas import CoachResponse
from app.schemas.conversation import MessageCreate
from app.services.ai_context import build_ai_context
from app.services.conversation import (
    ConversationNotFoundError,
    add_message,
    get_conversation,
)


class CareerCoachProviderError(RuntimeError):
    pass


def _build_prompt(
    context: dict[str, object],
    history: list[dict[str, str]],
    user_message: str,
) -> str:
    return CAREER_COACH_PROMPT.format(
        system_prompt=CAREER_COACH_SYSTEM_PROMPT.strip(),
        career_context=json.dumps(context, ensure_ascii=False, sort_keys=True),
        conversation_history=json.dumps(history, ensure_ascii=False),
        user_message=user_message,
    )


def generate_career_coach_response(
    db: Session,
    user_id: int,
    conversation_id: int,
    user_message: str,
    provider: AIProvider,
) -> CoachResponse:
    conversation = get_conversation(db, user_id, conversation_id)
    if conversation is None:
        raise ConversationNotFoundError("Conversation not found")

    context = build_ai_context(db, user_id)
    history = [
        {"role": message.role, "content": message.content}
        for message in conversation.messages
    ]
    prompt = _build_prompt(context, history, user_message)

    add_message(
        db,
        user_id,
        conversation_id,
        MessageCreate(role="user", content=user_message),
    )
    try:
        assistant_content = provider.generate(prompt)
    except Exception as exc:
        raise CareerCoachProviderError("Career coach generation failed") from exc

    assistant_message = add_message(
        db,
        user_id,
        conversation_id,
        MessageCreate(role="assistant", content=assistant_content),
    )
    return CoachResponse(
        conversation_id=conversation_id,
        message_id=assistant_message.id,
        content=assistant_message.content,
    )
