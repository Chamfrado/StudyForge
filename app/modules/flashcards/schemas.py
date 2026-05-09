import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FlashcardResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    material_id: uuid.UUID
    front: str
    back: str
    tags: list[str]
    difficulty: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FlashcardListResponse(BaseModel):
    flashcards: list[FlashcardResponse]


class FlashcardExportRow(BaseModel):
    front: str
    back: str
    tags: str