from pydantic import BaseModel, EmailStr, Field

from app.modules.users.schemas import UserResponse


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    user: UserResponse


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class AuthUserResponse(BaseModel):
    user: UserResponse