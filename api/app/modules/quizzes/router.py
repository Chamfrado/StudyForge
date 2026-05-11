import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.quizzes.schemas import (
    QuizListResponse,
    QuizQuestionResponse,
    QuizResponse,
    QuizAttemptCreateRequest,
    QuizAttemptListResponse,
    QuizAttemptResponse,
)
from app.modules.quizzes.service import QuizService
from app.modules.users.models import User

router = APIRouter(
    prefix="/quizzes",
    tags=["Quizzes"],
)

@router.get(
    "",
    response_model=QuizListResponse,
)
async def list_quizzes(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService(db)
    quizzes = await service.list_quizzes(current_user)

    return QuizListResponse(
        quizzes=[
            quiz
            for quiz in quizzes
        ] # type: ignore
    )


@router.get(
    "/{quiz_id}",
    response_model=QuizResponse,
)
async def get_quiz(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService(db)
    quiz, questions = await service.get_quiz(current_user, quiz_id)

    return QuizResponse(
        id=quiz.id,
        user_id=quiz.user_id,
        material_id=quiz.material_id,
        title=quiz.title,
        created_at=quiz.created_at,
        questions=[
            QuizQuestionResponse.model_validate(question, from_attributes=True)
            for question in questions
        ],
    )


@router.delete(
    "/{quiz_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_quiz(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService(db)
    await service.delete_quiz(current_user, quiz_id)

    return None

@router.post(
    "/{quiz_id}/attempts",
    response_model=QuizAttemptResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_quiz_attempt(
    quiz_id: uuid.UUID,
    data: QuizAttemptCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService(db)
    attempt = await service.create_attempt(current_user, quiz_id, data)

    return QuizAttemptResponse.model_validate(attempt, from_attributes=True)


@router.get(
    "/{quiz_id}/attempts",
    response_model=QuizAttemptListResponse,
)
async def list_quiz_attempts(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = QuizService(db)
    attempts = await service.list_attempts(current_user, quiz_id)

    return QuizAttemptListResponse(
        attempts=[
            QuizAttemptResponse.model_validate(attempt, from_attributes=True)
            for attempt in attempts
        ]
    )