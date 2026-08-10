from functools import lru_cache

from app.ai.base import AIProvider
from app.ai.providers.gemini_provider import GeminiProvider


@lru_cache
def get_ai_provider() -> AIProvider:
    """Return the configured provider; callers depend only on AIProvider."""
    return GeminiProvider()
