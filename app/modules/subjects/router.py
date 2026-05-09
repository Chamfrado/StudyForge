import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.subjects.schemas import (
    SubjectCreateRequest,
    SubjectListResponse,
    SubjectResponse,
    SubjectUpdateRequest,
)
from app.modules.subjects.service import SubjectService
from app.modules.users.models import User

router = APIRouter(
    prefix="/subjects",
    tags=["Subjects"],
)


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_subject(
    data: SubjectCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    subject = await service.create_subject(current_user, data)

    return SubjectResponse.model_validate(subject, from_attributes=True)


@router.get(
    "",
    response_model=SubjectListResponse,
)
async def list_subjects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    subjects = await service.list_subjects(current_user)

    return SubjectListResponse(
        subjects=[
            SubjectResponse.model_validate(subject, from_attributes=True)
            for subject in subjects
        ]
    )


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
)
async def get_subject(
    subject_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    subject = await service.get_subject(current_user, subject_id)

    return SubjectResponse.model_validate(subject, from_attributes=True)


@router.put(
    "/{subject_id}",
    response_model=SubjectResponse,
)
async def update_subject(
    subject_id: uuid.UUID,
    data: SubjectUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    subject = await service.update_subject(current_user, subject_id, data)

    return SubjectResponse.model_validate(subject, from_attributes=True)


@router.delete(
    "/{subject_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_subject(
    subject_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = SubjectService(db)
    await service.delete_subject(current_user, subject_id)

    return None