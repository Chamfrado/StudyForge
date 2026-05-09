from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.flashcards.models import Flashcard
from app.modules.materials.models import Material
from app.modules.quizzes.models import Quiz, QuizAttempt
from app.modules.subjects.models import Subject
from app.modules.users.models import User


class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self, current_user: User) -> dict:
        total_subjects = await self.db.scalar(
            select(func.count(Subject.id)).where(Subject.user_id == current_user.id)
        )

        total_materials = await self.db.scalar(
            select(func.count(Material.id)).where(Material.user_id == current_user.id)
        )

        total_flashcards = await self.db.scalar(
            select(func.count(Flashcard.id)).where(Flashcard.user_id == current_user.id)
        )

        total_quizzes = await self.db.scalar(
            select(func.count(Quiz.id)).where(Quiz.user_id == current_user.id)
        )

        total_quiz_attempts = await self.db.scalar(
            select(func.count(QuizAttempt.id)).where(QuizAttempt.user_id == current_user.id)
        )

        average_quiz_score = await self.db.scalar(
            select(func.avg(QuizAttempt.percentage)).where(
                QuizAttempt.user_id == current_user.id
            )
        )

        best_quiz_score = await self.db.scalar(
            select(func.max(QuizAttempt.percentage)).where(
                QuizAttempt.user_id == current_user.id
            )
        )

        latest_attempts_result = await self.db.scalars(
            select(QuizAttempt)
            .where(QuizAttempt.user_id == current_user.id)
            .order_by(QuizAttempt.created_at.desc())
            .limit(5)
        )

        latest_attempts = list(latest_attempts_result)

        return {
            "total_subjects": total_subjects or 0,
            "total_materials": total_materials or 0,
            "total_flashcards": total_flashcards or 0,
            "total_quizzes": total_quizzes or 0,
            "total_quiz_attempts": total_quiz_attempts or 0,
            "average_quiz_score": round(float(average_quiz_score or 0), 2),
            "best_quiz_score": round(float(best_quiz_score or 0), 2),
            "latest_attempts": latest_attempts,
        }