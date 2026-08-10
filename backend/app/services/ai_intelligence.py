import json
from typing import Any

from app.ai.base import AIProvider
from app.ai.prompts.intelligence import build_intelligence_prompt
from app.schemas.intelligence import CareerAnalysisResponse


class IntelligenceGenerationError(RuntimeError):
    """Raised when the provider cannot return a valid career analysis."""


def _extract_json(content: str) -> dict[str, Any]:
    text = content.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if lines and lines[0].strip().lower() in {"```", "```json"}:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    value = json.loads(text)
    if not isinstance(value, dict):
        raise ValueError("Career analysis must be a JSON object")
    return value


def generate_career_analysis(
    context: dict[str, Any],
    focus: str | None,
    provider: AIProvider,
) -> CareerAnalysisResponse:
    prompt = build_intelligence_prompt(context, focus)
    try:
        content = provider.generate(prompt)
        return CareerAnalysisResponse.model_validate(_extract_json(content))
    except Exception as exc:
        raise IntelligenceGenerationError(
            "AI provider failed to generate a valid career analysis"
        ) from exc
