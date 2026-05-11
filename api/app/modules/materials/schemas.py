import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MaterialResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    file_type: str
    original_filename: str
    storage_path: str
    extracted_text: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MaterialListItemResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    file_type: str
    original_filename: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MaterialListResponse(BaseModel):
    materials: list[MaterialListItemResponse]