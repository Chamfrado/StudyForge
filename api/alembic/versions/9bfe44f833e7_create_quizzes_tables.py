"""create quizzes tables

Revision ID: 9bfe44f833e7
Revises: 50516f7fc523
Create Date: 2026-05-09 16:11:13.367907

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '9bfe44f833e7'
down_revision: Union[str, Sequence[str], None] = '50516f7fc523'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "quizzes",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("material_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["material_id"],
            ["materials.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_quizzes_user_id"),
        "quizzes",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_quizzes_material_id"),
        "quizzes",
        ["material_id"],
        unique=False,
    )

    op.create_table(
        "quiz_questions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("quiz_id", sa.UUID(), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("options", postgresql.JSONB(), nullable=False),
        sa.Column("correct_answer", sa.String(length=10), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=False),
        sa.Column("difficulty", sa.String(length=30), nullable=False),
        sa.ForeignKeyConstraint(
            ["quiz_id"],
            ["quizzes.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_quiz_questions_quiz_id"),
        "quiz_questions",
        ["quiz_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_quiz_questions_quiz_id"), table_name="quiz_questions")
    op.drop_table("quiz_questions")

    op.drop_index(op.f("ix_quizzes_material_id"), table_name="quizzes")
    op.drop_index(op.f("ix_quizzes_user_id"), table_name="quizzes")
    op.drop_table("quizzes")