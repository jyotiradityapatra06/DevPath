import json
from typing import Any

from pydantic import ValidationError

from app.ai.base import AIProvider
from app.ai.prompts.interview import INTERVIEW_COACH_PROMPT
from app.schemas.interview import InterviewPreparationResponse


def _extract_json(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].strip().lower() in {"```", "```json"}:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return json.loads(text)


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
            data = _extract_json(response)
            return InterviewPreparationResponse(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise InterviewCoachError("Invalid AI interview response") from exc
        except Exception as exc:
            raise InterviewCoachError("AI provider failed") from exc


class InterviewCoachError(RuntimeError):
    """Raised when the provider cannot produce valid interview preparation."""
