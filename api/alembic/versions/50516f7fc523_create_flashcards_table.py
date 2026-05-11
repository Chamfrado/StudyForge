"""create flashcards table

Revision ID: 50516f7fc523
Revises: 20938c4be791
Create Date: 2026-05-09 15:59:57.309813

"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '50516f7fc523'
down_revision: Union[str, Sequence[str], None] = '20938c4be791'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "flashcards",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("material_id", sa.UUID(), nullable=False),
        sa.Column("front", sa.Text(), nullable=False),
        sa.Column("back", sa.Text(), nullable=False),
        sa.Column("tags", postgresql.JSONB(), nullable=False),
        sa.Column("difficulty", sa.String(length=30), nullable=False),
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
        op.f("ix_flashcards_user_id"),
        "flashcards",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_flashcards_material_id"),
        "flashcards",
        ["material_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_flashcards_material_id"), table_name="flashcards")
    op.drop_index(op.f("ix_flashcards_user_id"), table_name="flashcards")
    op.drop_table("flashcards")