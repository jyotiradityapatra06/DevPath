from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationCreate, MessageCreate


class ConversationNotFoundError(ValueError):
    pass


def create_conversation(
    db: Session, user_id: int, payload: ConversationCreate
) -> Conversation:
    conversation = Conversation(user_id=user_id, title=payload.title.strip())
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def list_conversations(db: Session, user_id: int) -> list[Conversation]:
    return list(
        db.scalars(
            select(Conversation)
            .where(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        ).all()
    )


def get_conversation(
    db: Session, user_id: int, conversation_id: int
) -> Conversation | None:
    return db.scalar(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
        .options(selectinload(Conversation.messages))
    )


def add_message(
    db: Session, user_id: int, conversation_id: int, payload: MessageCreate
) -> Message:
    conversation = get_conversation(db, user_id, conversation_id)
    if conversation is None:
        raise ConversationNotFoundError("Conversation not found")
    message = Message(
        conversation_id=conversation.id,
        role=payload.role,
        content=payload.content,
    )
    conversation.updated_at = datetime.now(timezone.utc)
    db.add(message)
    db.commit()
    db.refresh(message)
    return message
