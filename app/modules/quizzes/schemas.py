import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class QuizQuestionResponse(BaseModel):
    id: uuid.UUID
    quiz_id: uuid.UUID
    question: str
    options: list[str]
    correct_answer: str
    explanation: str
    difficulty: str

    model_config = ConfigDict(from_attributes=True)


class QuizResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    material_id: uuid.UUID
    title: str
    created_at: datetime
    questions: list[QuizQuestionResponse]


class QuizListItemResponse(BaseModel):
    id: uuid.UUID
    material_id: uuid.UUID
    title: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuizListResponse(BaseModel):
    quizzes: list[QuizListItemResponse]