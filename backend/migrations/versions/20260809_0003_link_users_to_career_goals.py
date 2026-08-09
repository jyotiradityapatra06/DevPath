"""Link users to their career goals.

Revision ID: 20260809_0003
Revises: 20260809_0002
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260809_0003"
down_revision: str | None = "20260809_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("career_goals", sa.Column("user_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_career_goals_user_id"), "career_goals", ["user_id"])
    op.create_foreign_key(
        "fk_career_goals_user_id", "career_goals", "users", ["user_id"], ["id"]
    )


def downgrade() -> None:
    op.drop_constraint("fk_career_goals_user_id", "career_goals", type_="foreignkey")
    op.drop_index(op.f("ix_career_goals_user_id"), table_name="career_goals")
    op.drop_column("career_goals", "user_id")
