import uuid

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.materials.schemas import (
    MaterialListItemResponse,
    MaterialListResponse,
    MaterialResponse,
)
from app.modules.materials.service import MaterialService
from app.modules.users.models import User

router = APIRouter(
    prefix="/materials",
    tags=["Materials"],
)


@router.post(
    "/upload",
    response_model=MaterialResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_material(
    subject_id: uuid.UUID = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MaterialService(db)

    material = await service.upload_material(
        current_user=current_user,
        subject_id=subject_id,
        title=title,
        file=file,
    )

    return MaterialResponse.model_validate(material, from_attributes=True)


@router.get(
    "",
    response_model=MaterialListResponse,
)
async def list_materials(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MaterialService(db)
    materials = await service.list_materials(current_user)

    return MaterialListResponse(
        materials=[
            MaterialListItemResponse.model_validate(material, from_attributes=True)
            for material in materials
        ]
    )


@router.get(
    "/{material_id}",
    response_model=MaterialResponse,
)
async def get_material(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MaterialService(db)
    material = await service.get_material(current_user, material_id)

    return MaterialResponse.model_validate(material, from_attributes=True)


@router.delete(
    "/{material_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_material(
    material_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MaterialService(db)
    await service.delete_material(current_user, material_id)

    return None