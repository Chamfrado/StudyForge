"""create summaries table

Revision ID: 20938c4be791
Revises: 42eb81e82a71
Create Date: 2026-05-09 15:51:00.601253

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '20938c4be791'
down_revision: Union[str, Sequence[str], None] = '42eb81e82a71'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "summaries",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("material_id", sa.UUID(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("key_points", postgresql.JSONB(), nullable=False),
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
        op.f("ix_summaries_user_id"),
        "summaries",
        ["user_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_summaries_material_id"),
        "summaries",
        ["material_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(op.f("ix_summaries_material_id"), table_name="summaries")
    op.drop_index(op.f("ix_summaries_user_id"), table_name="summaries")
    op.drop_table("summaries")