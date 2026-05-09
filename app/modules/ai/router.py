import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.ai.provider import get_ai_provider
from app.modules.ai.service import AIService
from app.modules.auth.dependencies import get_current_user
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