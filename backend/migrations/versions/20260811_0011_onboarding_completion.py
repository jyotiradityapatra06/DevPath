"""Persist onboarding completion state.

Revision ID: 20260811_0011
Revises: 20260811_0010
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260811_0011"
down_revision: str | None = "20260811_0010"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "onboarding_completed",
            sa.Boolean(),
            server_default=sa.false(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    op.drop_column("users", "onboarding_completed")
