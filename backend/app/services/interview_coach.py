import json
from typing import Any

from pydantic import ValidationError

from app.ai.base import AIProvider
from app.ai.prompts.interview import INTERVIEW_COACH_PROMPT
from app.schemas.interview import InterviewPreparationResponse


class InterviewCoachService:
    def __init__(self, provider: AIProvider) -> None:
        self.provider = provider

    def generate_interview_plan(
        self, context: dict[str, Any]
    ) -> InterviewPreparationResponse:
        try:
            serialized_context = json.dumps(context, default=str)
            prompt = INTERVIEW_COACH_PROMPT.replace(
                "{context}", serialized_context
            )
            response = self.provider.generate(prompt)
            data = json.loads(response)
            return InterviewPreparationResponse(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise InterviewCoachError("Invalid AI interview response") from exc
        except Exception as exc:
            raise InterviewCoachError("AI provider failed") from exc


class InterviewCoachError(RuntimeError):
    """Raised when the provider cannot produce valid interview preparation."""
