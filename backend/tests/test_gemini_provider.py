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
    monkeypatch.setattr(
        gemini_provider.settings,
        "GEMINI_API_KEY",
        "",
    )

    with pytest.raises(
        GeminiConfigurationError,
        match="GEMINI_API_KEY",
    ):
        GeminiProvider()


def test_successful_mocked_generation(
    monkeypatch: pytest.MonkeyPatch,
) -> None:

    monkeypatch.setattr(
        gemini_provider.settings,
        "GEMINI_API_KEY",
        "test-key",
    )

    mock_client = Mock()

    mock_client.models.generate_content.return_value = (
        SimpleNamespace(
            text="Career guidance"
        )
    )

    monkeypatch.setattr(
        gemini_provider.genai,
        "Client",
        Mock(return_value=mock_client),
    )

    provider = GeminiProvider(
        model="test-model"
    )

    result = provider.generate(
        "What should I learn next?"
    )

    mock_client.models.generate_content.assert_called_once_with(
        model="test-model",
        contents="What should I learn next?",
    )

    assert result == "Career guidance"


def test_initialization_failure(
    monkeypatch: pytest.MonkeyPatch,
) -> None:

    monkeypatch.setattr(
        gemini_provider.settings,
        "GEMINI_API_KEY",
        "test-key",
    )

    monkeypatch.setattr(
        gemini_provider.genai,
        "Client",
        Mock(
            side_effect=RuntimeError(
                "SDK unavailable"
            )
        ),
    )

    with pytest.raises(
        GeminiInitializationError
    ) as exc_info:

        GeminiProvider()

    assert isinstance(
        exc_info.value.__cause__,
        RuntimeError,
    )


def test_provider_failure_handling(
    monkeypatch: pytest.MonkeyPatch,
) -> None:

    monkeypatch.setattr(
        gemini_provider.settings,
        "GEMINI_API_KEY",
        "test-key",
    )

    mock_client = Mock()

    mock_client.models.generate_content.side_effect = (
        RuntimeError(
            "provider unavailable"
        )
    )

    monkeypatch.setattr(
        gemini_provider.genai,
        "Client",
        Mock(return_value=mock_client),
    )

    provider = GeminiProvider()

    with pytest.raises(
        GeminiGenerationError
    ) as exc_info:

        provider.generate(
            "Generate career guidance"
        )

    assert isinstance(
        exc_info.value.__cause__,
        RuntimeError,
    )