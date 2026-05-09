import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.quizzes.models import Quiz, QuizQuestion
from app.modules.users.models import User


class QuizService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_quizzes(self, current_user: User) -> list[Quiz]:
        result = await self.db.scalars(
            select(Quiz)
            .where(Quiz.user_id == current_user.id)
            .order_by(Quiz.created_at.desc())
        )

        return list(result)

    async def get_quiz(
        self,
        current_user: User,
        quiz_id: uuid.UUID,
    ) -> tuple[Quiz, list[QuizQuestion]]:
        quiz = await self.db.scalar(
            select(Quiz).where(
                Quiz.id == quiz_id,
                Quiz.user_id == current_user.id,
            )
        )

        if quiz is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Quiz not found.",
            )

        result = await self.db.scalars(
            select(QuizQuestion)
            .where(QuizQuestion.quiz_id == quiz.id)
        )

        questions = list(result)

        return quiz, questions

    async def delete_quiz(
        self,
        current_user: User,
        quiz_id: uuid.UUID,
    ) -> None:
        quiz, _ = await self.get_quiz(current_user, quiz_id)

        await self.db.delete(quiz)
        await self.db.commit()