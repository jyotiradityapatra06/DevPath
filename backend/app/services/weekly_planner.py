import json
from typing import Any

from pydantic import ValidationError

from app.ai.base import AIProvider
from app.ai.prompts.planner import WEEKLY_PLANNER_PROMPT
from app.schemas.weekly_planner import WeeklyLearningPlanResponse


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
            data = json.loads(response)
            return WeeklyLearningPlanResponse(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise WeeklyPlannerError("Invalid AI weekly plan response") from exc
        except Exception as exc:
            raise WeeklyPlannerError("AI provider failed") from exc


class WeeklyPlannerError(RuntimeError):
    """Raised when the provider cannot produce a valid weekly learning plan."""
