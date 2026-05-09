from pydantic import BaseModel, Field


class AISummaryResult(BaseModel):
    content: str = Field(min_length=1)
    key_points: list[str] = Field(default_factory=list)


class AIFlashcardResult(BaseModel):
    front: str = Field(min_length=1)
    back: str = Field(min_length=1)
    tags: list[str] = Field(default_factory=list)
    difficulty: str = "MEDIUM"


class AIFlashcardsResult(BaseModel):
    flashcards: list[AIFlashcardResult]