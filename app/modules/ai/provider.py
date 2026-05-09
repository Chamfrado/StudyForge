from abc import ABC, abstractmethod

from app.modules.ai.schemas import (
    AIFlashcardResult,
    AIFlashcardsResult,
    AISummaryResult,
)


class AIProvider(ABC):
    @abstractmethod
    async def generate_summary(self, text: str) -> AISummaryResult:
        raise NotImplementedError

    @abstractmethod
    async def generate_flashcards(self, text: str) -> AIFlashcardsResult:
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

    async def generate_flashcards(self, text: str) -> AIFlashcardsResult:
        clean_text = " ".join(text.split())
        preview = clean_text[:180]

        flashcards = [
            AIFlashcardResult(
                front="What is the main purpose of this material?",
                back="The material presents study content that should be reviewed and transformed into learning notes.",
                tags=["mock", "overview"],
                difficulty="EASY",
            ),
            AIFlashcardResult(
                front="What should the student do after reading the material?",
                back="The student should identify the main concepts, review key points, and practice active recall.",
                tags=["study", "active-recall"],
                difficulty="MEDIUM",
            ),
            AIFlashcardResult(
                front="What is a preview of the uploaded material?",
                back=preview,
                tags=["material-preview"],
                difficulty="EASY",
            ),
        ]

        return AIFlashcardsResult(flashcards=flashcards)


def get_ai_provider() -> AIProvider:
    return MockAIProvider()