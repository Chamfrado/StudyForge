import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubjectCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=1000)


class SubjectUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, max_length=1000)


class SubjectResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    description: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubjectListResponse(BaseModel):
    subjects: list[SubjectResponse]