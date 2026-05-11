import uuid
from datetime import datetime

from pydantic import BaseModel


class LatestAttemptResponse(BaseModel):
    id: uuid.UUID
    quiz_id: uuid.UUID
    score: int
    total_questions: int
    percentage: float
    created_at: datetime


class AnalyticsOverviewResponse(BaseModel):
    total_subjects: int
    total_materials: int
    total_flashcards: int
    total_quizzes: int
    total_quiz_attempts: int
    average_quiz_score: float
    best_quiz_score: float
    latest_attempts: list[LatestAttemptResponse]


class SubjectAnalyticsResponse(BaseModel):
    subject_id: uuid.UUID
    subject_name: str
    total_materials: int
    total_flashcards: int
    total_quizzes: int
    total_quiz_attempts: int
    average_quiz_score: float
    best_quiz_score: float
    latest_attempts: list[LatestAttemptResponse]