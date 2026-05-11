import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.analytics.schemas import (
    AnalyticsOverviewResponse,
    LatestAttemptResponse,
    SubjectAnalyticsResponse,
)
from app.modules.analytics.service import AnalyticsService
from app.modules.auth.dependencies import get_current_user
from app.modules.users.models import User

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"],
)


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
)
async def get_analytics_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AnalyticsService(db)
    overview = await service.get_overview(current_user)

    return AnalyticsOverviewResponse(
        total_subjects=overview["total_subjects"],
        total_materials=overview["total_materials"],
        total_flashcards=overview["total_flashcards"],
        total_quizzes=overview["total_quizzes"],
        total_quiz_attempts=overview["total_quiz_attempts"],
        average_quiz_score=overview["average_quiz_score"],
        best_quiz_score=overview["best_quiz_score"],
        latest_attempts=[
            LatestAttemptResponse(
                id=attempt.id,
                quiz_id=attempt.quiz_id,
                score=attempt.score,
                total_questions=attempt.total_questions,
                percentage=attempt.percentage,
                created_at=attempt.created_at,
            )
            for attempt in overview["latest_attempts"]
        ],
    )


@router.get(
    "/subjects/{subject_id}",
    response_model=SubjectAnalyticsResponse,
)
async def get_subject_analytics(
    subject_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = AnalyticsService(db)
    analytics = await service.get_subject_analytics(current_user, subject_id)

    return SubjectAnalyticsResponse(
        subject_id=analytics["subject_id"],
        subject_name=analytics["subject_name"],
        total_materials=analytics["total_materials"],
        total_flashcards=analytics["total_flashcards"],
        total_quizzes=analytics["total_quizzes"],
        total_quiz_attempts=analytics["total_quiz_attempts"],
        average_quiz_score=analytics["average_quiz_score"],
        best_quiz_score=analytics["best_quiz_score"],
        latest_attempts=[
            LatestAttemptResponse(
                id=attempt.id,
                quiz_id=attempt.quiz_id,
                score=attempt.score,
                total_questions=attempt.total_questions,
                percentage=attempt.percentage,
                created_at=attempt.created_at,
            )
            for attempt in analytics["latest_attempts"]
        ],
    )