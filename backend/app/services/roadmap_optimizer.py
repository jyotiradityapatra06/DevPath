import json

from pydantic import ValidationError

from app.ai.prompts.adaptive import (
    ROADMAP_OPTIMIZER_PROMPT,
)

from app.ai.base import AIProvider

from app.schemas.adaptive_ai import (
    RoadmapOptimizationResponse,
)


class RoadmapOptimizerService:

    def __init__(
        self,
        provider: AIProvider,
    ):
        self.provider = provider


    def optimize(
        self,
        context: dict,
    ) -> RoadmapOptimizationResponse:

        try:
            prompt = ROADMAP_OPTIMIZER_PROMPT.replace(
                "{context}", json.dumps(context, default=str)
            )
            response = self.provider.generate(prompt)
            data = json.loads(response)
            return RoadmapOptimizationResponse(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise RoadmapOptimizationError("Invalid AI roadmap response") from exc
        except Exception as exc:
            raise RoadmapOptimizationError("AI provider failed") from exc


class RoadmapOptimizationError(RuntimeError):
    """Raised when the provider cannot produce a valid optimization."""
