from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.auth.schemas import LoginRequest, RegisterRequest
from app.modules.users.models import User


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, data: RegisterRequest) -> User:
        existing_user = await self.db.scalar(
            select(User).where(User.email == data.email.lower())
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            )

        user = User(
            full_name=data.full_name,
            email=data.email.lower(),
            password_hash=hash_password(data.password),
        )

        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        return user

    async def login(self, data: LoginRequest) -> tuple[str, User]:
        user = await self.db.scalar(
            select(User).where(User.email == data.email.lower())
        )

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        token = create_access_token(subject=str(user.id))

        return token, user