from abc import ABC, abstractmethod

from app.modules.ai.schemas import (
    AIFlashcardResult,
    AIFlashcardsResult,
    AIQuizQuestionResult,
    AIQuizResult,
    AISummaryResult,
)


class AIProvider(ABC):
    @abstractmethod
    async def generate_summary(self, text: str) -> AISummaryResult:
        raise NotImplementedError

    @abstractmethod
    async def generate_flashcards(self, text: str) -> AIFlashcardsResult:
        raise NotImplementedError

    @abstractmethod
    async def generate_quiz(self, text: str) -> AIQuizResult:
        raise NotImplementedError


class MockAIProvider(AIProvider):
    async def generate_summary(self, text: str) -> AISummaryResult:
        clean_text = " ".join(text.split())
        preview = clean_text[:500]

        return AISummaryResult(
            content=(
                "This is a mock AI-generated summary. "
                "The material introduces important study content and highlights "
                "the main ideas in a simplified way.\n\n"
                f"Material preview: {preview}"
            ),
            key_points=[
                "The material contains relevant study information.",
                "The main concepts should be reviewed carefully.",
                "This mock provider will later be replaced by a real LLM provider.",
            ],
        )

    async def generate_flashcards(self, text: str) -> AIFlashcardsResult:
        clean_text = " ".join(text.split())
        preview = clean_text[:180]

        return AIFlashcardsResult(
            flashcards=[
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
        )

    async def generate_quiz(self, text: str) -> AIQuizResult:
        clean_text = " ".join(text.split())
        preview = clean_text[:160]

        return AIQuizResult(
            title="Mock Quiz Generated from Material",
            questions=[
                AIQuizQuestionResult(
                    question="What is the main objective of the uploaded material?",
                    options=[
                        "To present study content for review",
                        "To delete user data",
                        "To configure Docker only",
                        "To replace the database",
                    ],
                    correct_answer="A",
                    explanation="The material is used as study content that can be summarized, reviewed, and transformed into learning resources.",
                    difficulty="EASY",
                ),
                AIQuizQuestionResult(
                    question="Which study strategy is most related to flashcards?",
                    options=[
                        "Passive reading only",
                        "Active recall",
                        "Ignoring mistakes",
                        "Removing all notes",
                    ],
                    correct_answer="B",
                    explanation="Flashcards are strongly connected to active recall, because the learner tries to remember the answer before checking it.",
                    difficulty="MEDIUM",
                ),
                AIQuizQuestionResult(
                    question="Which option best represents a preview of this material?",
                    options=[
                        preview,
                        "No content was uploaded",
                        "The file was empty",
                        "The database rejected the material",
                    ],
                    correct_answer="A",
                    explanation="The first option contains a short preview extracted from the uploaded material.",
                    difficulty="EASY",
                ),
            ],
        )


def get_ai_provider() -> AIProvider:
    return MockAIProvider()