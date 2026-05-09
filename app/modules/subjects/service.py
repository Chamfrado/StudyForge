import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.subjects.models import Subject
from app.modules.subjects.schemas import SubjectCreateRequest, SubjectUpdateRequest
from app.modules.users.models import User


class SubjectService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_subject(
        self,
        current_user: User,
        data: SubjectCreateRequest,
    ) -> Subject:
        subject = Subject(
            user_id=current_user.id,
            name=data.name,
            description=data.description,
        )

        self.db.add(subject)
        await self.db.commit()
        await self.db.refresh(subject)

        return subject

    async def list_subjects(self, current_user: User) -> list[Subject]:
        result = await self.db.scalars(
            select(Subject)
            .where(Subject.user_id == current_user.id)
            .order_by(Subject.created_at.desc())
        )

        return list(result)

    async def get_subject(
        self,
        current_user: User,
        subject_id: uuid.UUID,
    ) -> Subject:
        subject = await self.db.scalar(
            select(Subject).where(
                Subject.id == subject_id,
                Subject.user_id == current_user.id,
            )
        )

        if subject is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found.",
            )

        return subject

    async def update_subject(
        self,
        current_user: User,
        subject_id: uuid.UUID,
        data: SubjectUpdateRequest,
    ) -> Subject:
        subject = await self.get_subject(current_user, subject_id)

        if data.name is not None:
            subject.name = data.name

        if data.description is not None:
            subject.description = data.description

        await self.db.commit()
        await self.db.refresh(subject)

        return subject

    async def delete_subject(
        self,
        current_user: User,
        subject_id: uuid.UUID,
    ) -> None:
        subject = await self.get_subject(current_user, subject_id)

        await self.db.delete(subject)
        await self.db.commit()