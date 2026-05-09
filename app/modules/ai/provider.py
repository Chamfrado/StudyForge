from abc import ABC, abstractmethod

from app.modules.ai.schemas import AISummaryResult


class AIProvider(ABC):
    @abstractmethod
    async def generate_summary(self, text: str) -> AISummaryResult:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    async def generate_summary(self, text: str) -> AISummaryResult:
        clean_text = " ".join(text.split())

        preview = clean_text[:500]

        content = (
            "This is a mock AI-generated summary. "
            "The material introduces important study content and highlights "
            "the main ideas in a simplified way.\n\n"
            f"Material preview: {preview}"
        )

        key_points = [
            "The material contains relevant study information.",
            "The main concepts should be reviewed carefully.",
            "This mock provider will later be replaced by a real LLM provider.",
        ]

        return AISummaryResult(
            content=content,
            key_points=key_points,
        )


def get_ai_provider() -> AIProvider:
    return MockAIProvider()