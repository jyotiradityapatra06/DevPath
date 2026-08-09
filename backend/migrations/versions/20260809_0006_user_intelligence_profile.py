"""Upgrade profiles for user intelligence.

Revision ID: 20260809_0006
Revises: 20260809_0005
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260809_0006"

down_revision: str | None = "20260809_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("profiles", sa.Column("degree", sa.String(length=255), nullable=True))
    op.add_column("profiles", sa.Column("graduation_year", sa.Integer(), nullable=True))
    op.add_column("profiles", sa.Column("preferred_domain", sa.String(length=100), nullable=True))
    op.add_column("profiles", sa.Column("learning_style", sa.String(length=100), nullable=True))
    op.add_column("profiles", sa.Column("weekly_learning_hours", sa.Integer(), nullable=True))
    op.add_column("profiles", sa.Column("target_timeline", sa.String(length=100), nullable=True))
    op.add_column(
        "profiles",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_column("profiles", "updated_at")
    op.drop_column("profiles", "target_timeline")
    op.drop_column("profiles", "weekly_learning_hours")
    op.drop_column("profiles", "learning_style")
    op.drop_column("profiles", "preferred_domain")
    op.drop_column("profiles", "graduation_year")
    op.drop_column("profiles", "degree")
