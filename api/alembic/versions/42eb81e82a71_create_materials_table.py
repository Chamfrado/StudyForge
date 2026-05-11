"""create materials table

Revision ID: 42eb81e82a71
Revises: 18061415cd36
Create Date: 2026-05-09 15:31:38.239703

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '42eb81e82a71'
down_revision: Union[str, Sequence[str], None] = '18061415cd36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "materials",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("subject_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("file_type", sa.String(length=20), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["subject_id"],
            ["subjects.id"],
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
        op.f("ix_materials_user_id"),
        "materials",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_materials_subject_id"),
        "materials",
        ["subject_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_materials_subject_id"), table_name="materials")
    op.drop_index(op.f("ix_materials_user_id"), table_name="materials")
    op.drop_table("materials")