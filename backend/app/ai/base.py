from abc import ABC, abstractmethod


class AIProvider(ABC):
    """Provider-independent contract for text generation backends."""

    @abstractmethod
    def generate(self, prompt: str) -> str:
        """Generate text for a fully constructed prompt."""
        raise NotImplementedError
