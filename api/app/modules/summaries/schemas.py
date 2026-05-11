import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SummaryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    material_id: uuid.UUID
    content: str
    key_points: list[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)