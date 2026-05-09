import csv
import io
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.flashcards.models import Flashcard
from app.modules.users.models import User


class FlashcardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_flashcards(self, current_user: User) -> list[Flashcard]:
        result = await self.db.scalars(
            select(Flashcard)
            .where(Flashcard.user_id == current_user.id)
            .order_by(Flashcard.created_at.desc())
        )

        return list(result)

    async def get_flashcard(
        self,
        current_user: User,
        flashcard_id: uuid.UUID,
    ) -> Flashcard:
        flashcard = await self.db.scalar(
            select(Flashcard).where(
                Flashcard.id == flashcard_id,
                Flashcard.user_id == current_user.id,
            )
        )

        if flashcard is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Flashcard not found.",
            )

        return flashcard

    async def delete_flashcard(
        self,
        current_user: User,
        flashcard_id: uuid.UUID,
    ) -> None:
        flashcard = await self.get_flashcard(current_user, flashcard_id)

        await self.db.delete(flashcard)
        await self.db.commit()

    async def export_flashcards_csv(self, current_user: User) -> str:
        flashcards = await self.list_flashcards(current_user)

        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["front", "back", "tags"])

        for flashcard in flashcards:
            tags = ";".join(flashcard.tags or [])

            writer.writerow(
                [
                    flashcard.front,
                    flashcard.back,
                    tags,
                ]
            )

        return output.getvalue()