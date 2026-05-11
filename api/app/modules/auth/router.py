from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import (
    AuthUserResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
)
from app.modules.auth.service import AuthService
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    user = await service.register(data)

    return RegisterResponse(
        user=UserResponse.model_validate(user, from_attributes=True)
    )


@router.post(
    "/login",
    response_model=LoginResponse,
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    service = AuthService(db)
    token, user = await service.login(data)

    return LoginResponse(
        access_token=token,
        user=UserResponse.model_validate(user, from_attributes=True),
    )


@router.get(
    "/me",
    response_model=AuthUserResponse,
)
async def me(
    current_user: User = Depends(get_current_user),
):
    return AuthUserResponse(
        user=UserResponse.model_validate(current_user, from_attributes=True)
    )