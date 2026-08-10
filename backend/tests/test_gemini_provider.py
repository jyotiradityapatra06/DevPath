from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.ai.providers import gemini_provider
from app.ai.providers.gemini_provider import (
    GeminiConfigurationError,
    GeminiGenerationError,
    GeminiInitializationError,
    GeminiProvider,
)


def test_missing_api_key(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    with pytest.raises(GeminiConfigurationError, match="GEMINI_API_KEY"):
        GeminiProvider()


def test_successful_mocked_generation(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setenv("GEMINI_MODEL", "test-model")
    model = Mock()
    model.generate_content.return_value = SimpleNamespace(text="Career guidance")
    configure = Mock()
    generative_model = Mock(return_value=model)
    monkeypatch.setattr(gemini_provider.genai, "configure", configure)
    monkeypatch.setattr(gemini_provider.genai, "GenerativeModel", generative_model)

    provider = GeminiProvider()
    result = provider.generate("What should I learn next?")

    configure.assert_called_once_with(api_key="test-key")
    generative_model.assert_called_once_with("test-model")
    model.generate_content.assert_called_once_with("What should I learn next?")
    assert result == "Career guidance"


def test_initialization_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(gemini_provider.genai, "configure", Mock())
    monkeypatch.setattr(
        gemini_provider.genai,
        "GenerativeModel",
        Mock(side_effect=RuntimeError("SDK unavailable")),
    )

    with pytest.raises(GeminiInitializationError) as exc_info:
        GeminiProvider()

    assert isinstance(exc_info.value.__cause__, RuntimeError)


def test_provider_failure_handling(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    model = Mock()
    model.generate_content.side_effect = RuntimeError("provider unavailable")
    monkeypatch.setattr(gemini_provider.genai, "configure", Mock())
    monkeypatch.setattr(
        gemini_provider.genai, "GenerativeModel", Mock(return_value=model)
    )
    provider = GeminiProvider()

    with pytest.raises(GeminiGenerationError) as exc_info:
        provider.generate("Generate career guidance")

    assert isinstance(exc_info.value.__cause__, RuntimeError)
