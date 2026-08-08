"""enforce progress status values

Revision ID: 7b12d21f4c89
Revises: a5c9464bee9a
Create Date: 2026-08-08
"""
from collections.abc import Sequence

from alembic import op


revision: str = "7b12d21f4c89"
down_revision: str | None = "a5c9464bee9a"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_progress_status",
        "progress",
        "status IN ('not_started', 'in_progress', 'completed')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_progress_status", "progress", type_="check")
