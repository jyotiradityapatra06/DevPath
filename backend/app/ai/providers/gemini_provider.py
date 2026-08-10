import os
from typing import Any

import google.generativeai as genai

from app.ai.base import AIProvider


DEFAULT_GEMINI_MODEL = "gemini-1.5-flash"


class GeminiProviderError(RuntimeError):
    """Base error raised by the Gemini provider adapter."""


class GeminiConfigurationError(GeminiProviderError):
    """Raised when required Gemini configuration is unavailable."""


class GeminiInitializationError(GeminiProviderError):
    """Raised when the Gemini SDK or model cannot be initialized."""


class GeminiGenerationError(GeminiProviderError):
    """Raised when Gemini cannot produce usable text."""


class GeminiProvider(AIProvider):
    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
    ) -> None:
        resolved_api_key = (api_key or os.getenv("GEMINI_API_KEY", "")).strip()
        if not resolved_api_key:
            raise GeminiConfigurationError("GEMINI_API_KEY is not configured")

        self.model_name = (
            model or os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL)
        ).strip()
        if not self.model_name:
            self.model_name = DEFAULT_GEMINI_MODEL

        try:
            genai.configure(api_key=resolved_api_key)
            self._model: Any = genai.GenerativeModel(self.model_name)
        except Exception as exc:
            raise GeminiInitializationError(
                "Unable to initialize the Gemini provider"
            ) from exc

    def generate(self, prompt: str) -> str:
        if not prompt.strip():
            raise GeminiGenerationError("Prompt cannot be empty")
        try:
            response = self._model.generate_content(prompt)
            content = getattr(response, "text", None)
        except Exception as exc:
            raise GeminiGenerationError("Gemini generation failed") from exc
        if not isinstance(content, str) or not content.strip():
            raise GeminiGenerationError("Gemini returned no text content")
        return content
