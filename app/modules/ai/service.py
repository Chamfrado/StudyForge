import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.ai.provider import AIProvider
from app.modules.flashcards.models import Flashcard
from app.modules.materials.models import Material
from app.modules.summaries.models import Summary
from app.modules.users.models import User


class AIService:
    def __init__(self, db: AsyncSession, provider: AIProvider):
        self.db = db
        self.provider = provider

    async def _get_user_material(
        self,
        current_user: User,
        material_id: uuid.UUID,
    ) -> Material:
        material = await self.db.scalar(
            select(Material).where(
                Material.id == material_id,
                Material.user_id == current_user.id,
            )
        )

        if material is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Material not found.",
            )

        if not material.extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Material has no extracted text.",
            )

        return material

    async def generate_material_summary(
        self,
        current_user: User,
        material_id: uuid.UUID,
    ) -> Summary:
        material = await self._get_user_material(current_user, material_id)

        ai_result = await self.provider.generate_summary(material.extracted_text)

        summary = Summary(
            user_id=current_user.id,
            material_id=material.id,
            content=ai_result.content,
            key_points=ai_result.key_points,
        )

        self.db.add(summary)
        await self.db.commit()
        await self.db.refresh(summary)

        return summary

    async def generate_material_flashcards(
        self,
        current_user: User,
        material_id: uuid.UUID,
    ) -> list[Flashcard]:
        material = await self._get_user_material(current_user, material_id)

        ai_result = await self.provider.generate_flashcards(material.extracted_text)

        flashcards = [
            Flashcard(
                user_id=current_user.id,
                material_id=material.id,
                front=item.front,
                back=item.back,
                tags=item.tags,
                difficulty=item.difficulty,
            )
            for item in ai_result.flashcards
        ]

        self.db.add_all(flashcards)
        await self.db.commit()

        for flashcard in flashcards:
            await self.db.refresh(flashcard)

        return flashcards