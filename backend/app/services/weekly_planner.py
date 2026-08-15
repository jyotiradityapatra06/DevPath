import json
from typing import Any

from pydantic import ValidationError

from app.ai.base import AIProvider
from app.ai.prompts.planner import WEEKLY_PLANNER_PROMPT
from app.schemas.weekly_planner import WeeklyLearningPlanResponse


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


class WeeklyPlannerService:
    def __init__(self, provider: AIProvider) -> None:
        self.provider = provider

    def generate_plan(self, context: dict[str, Any]) -> WeeklyLearningPlanResponse:
        try:
            serialized_context = json.dumps(context, default=str)
            prompt = WEEKLY_PLANNER_PROMPT.replace(
                "{context}", serialized_context
            )
            response = self.provider.generate(prompt)
            data = _extract_json(response)
            return WeeklyLearningPlanResponse(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise WeeklyPlannerError("Invalid AI weekly plan response") from exc
        except Exception as exc:
            raise WeeklyPlannerError("AI provider failed") from exc


class WeeklyPlannerError(RuntimeError):
    """Raised when the provider cannot produce a valid weekly learning plan."""
