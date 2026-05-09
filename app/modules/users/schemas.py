import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)