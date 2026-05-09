import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.quizzes.models import Quiz, QuizAttempt, QuizQuestion
from app.modules.quizzes.schemas import QuizAttemptCreateRequest
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
            select(QuizQuestion).where(QuizQuestion.quiz_id == quiz.id)
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

    async def create_attempt(
        self,
        current_user: User,
        quiz_id: uuid.UUID,
        data: QuizAttemptCreateRequest,
    ) -> QuizAttempt:
        quiz, questions = await self.get_quiz(current_user, quiz_id)

        question_map = {question.id: question for question in questions}

        if not data.answers:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one answer is required.",
            )

        results = []
        score = 0

        for answer in data.answers:
            question = question_map.get(answer.question_id)

            if question is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Question {answer.question_id} does not belong to this quiz.",
                )

            selected = answer.selected_answer.strip().upper()
            correct = question.correct_answer.strip().upper()
            is_correct = selected == correct

            if is_correct:
                score += 1

            results.append(
                {
                    "question_id": str(question.id),
                    "selected_answer": selected,
                    "correct_answer": correct,
                    "is_correct": is_correct,
                }
            )

        total_questions = len(questions)
        percentage = round((score / total_questions) * 100, 2) if total_questions else 0

        attempt = QuizAttempt(
            user_id=current_user.id,
            quiz_id=quiz.id,
            answers=results,
            score=score,
            total_questions=total_questions,
            percentage=percentage,
        )

        self.db.add(attempt)
        await self.db.commit()
        await self.db.refresh(attempt)

        return attempt

    async def list_attempts(
        self,
        current_user: User,
        quiz_id: uuid.UUID,
    ) -> list[QuizAttempt]:
        await self.get_quiz(current_user, quiz_id)

        result = await self.db.scalars(
            select(QuizAttempt)
            .where(
                QuizAttempt.quiz_id == quiz_id,
                QuizAttempt.user_id == current_user.id,
            )
            .order_by(QuizAttempt.created_at.desc())
        )

        return list(result)