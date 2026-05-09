import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.ai.provider import get_ai_provider
from app.modules.ai.service import AIService
from app.modules.auth.dependencies import get_current_user
from app.modules.flashcards.schemas import FlashcardListResponse, FlashcardResponse
from app.modules.quizzes.schemas import QuizQuestionResponse, QuizResponse
from app.modules.summaries.schemas import SummaryResponse
from app.modules.users.models import User

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


@router.post(
    "/materials/{material_id}/summary",
    response_model=SummaryResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_summary(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    provider = get_ai_provider()
    service = AIService(db=db, provider=provider)

    summary = await service.generate_material_summary(
        current_user=current_user,
        material_id=material_id,
    )

    return SummaryResponse.model_validate(summary, from_attributes=True)


@router.post(
    "/materials/{material_id}/flashcards",
    response_model=FlashcardListResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_flashcards(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    provider = get_ai_provider()
    service = AIService(db=db, provider=provider)

    flashcards = await service.generate_material_flashcards(
        current_user=current_user,
        material_id=material_id,
    )

    return FlashcardListResponse(
        flashcards=[
            FlashcardResponse.model_validate(flashcard, from_attributes=True)
            for flashcard in flashcards
        ]
    )


@router.post(
    "/materials/{material_id}/quiz",
    response_model=QuizResponse,
    status_code=status.HTTP_201_CREATED,
)
async def generate_quiz(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    provider = get_ai_provider()
    service = AIService(db=db, provider=provider)

    quiz, questions = await service.generate_material_quiz(
        current_user=current_user,
        material_id=material_id,
    )

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