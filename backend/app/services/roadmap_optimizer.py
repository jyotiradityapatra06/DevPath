import json

from pydantic import ValidationError

from app.ai.prompts.adaptive import (
    ROADMAP_OPTIMIZER_PROMPT,
)

from app.ai.base import AIProvider

from app.schemas.adaptive_ai import (
    RoadmapOptimizationResponse,
)


def _extract_json(content: str) -> dict:
    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].strip().lower() in {"```", "```json"}:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return json.loads(text)


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
            data = _extract_json(response)
            return RoadmapOptimizationResponse(**data)
        except (json.JSONDecodeError, ValidationError, TypeError) as exc:
            raise RoadmapOptimizationError("Invalid AI roadmap response") from exc
        except Exception as exc:
            raise RoadmapOptimizationError("AI provider failed") from exc


class RoadmapOptimizationError(RuntimeError):
    """Raised when the provider cannot produce a valid optimization."""
