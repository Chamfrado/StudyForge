import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.flashcards.schemas import FlashcardListResponse, FlashcardResponse
from app.modules.flashcards.service import FlashcardService
from app.modules.users.models import User

router = APIRouter(
    prefix="/flashcards",
    tags=["Flashcards"],
)


@router.get(
    "",
    response_model=FlashcardListResponse,
)
async def list_flashcards(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = FlashcardService(db)
    flashcards = await service.list_flashcards(current_user)

    return FlashcardListResponse(
        flashcards=[
            FlashcardResponse.model_validate(flashcard, from_attributes=True)
            for flashcard in flashcards
        ]
    )


@router.get(
    "/export/csv",
)
async def export_flashcards_csv(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = FlashcardService(db)
    csv_content = await service.export_flashcards_csv(current_user)

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="studyforge-flashcards.csv"'
        },
    )


@router.get(
    "/{flashcard_id}",
    response_model=FlashcardResponse,
)
async def get_flashcard(
    flashcard_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = FlashcardService(db)
    flashcard = await service.get_flashcard(current_user, flashcard_id)

    return FlashcardResponse.model_validate(flashcard, from_attributes=True)


@router.delete(
    "/{flashcard_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_flashcard(
    flashcard_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = FlashcardService(db)
    await service.delete_flashcard(current_user, flashcard_id)

    return None