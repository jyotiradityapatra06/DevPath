"""Add persisted skill gap analyses.

Revision ID: 20260809_0004
Revises: 20260809_0003
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260809_0004"
down_revision: str | None = "20260809_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "skill_gaps",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("overall_score", sa.Float(), nullable=False),
        sa.Column(
            "generated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_skill_gaps_role_id"), "skill_gaps", ["role_id"])
    op.create_index(op.f("ix_skill_gaps_user_id"), "skill_gaps", ["user_id"])


def downgrade() -> None:
    op.drop_index(op.f("ix_skill_gaps_user_id"), table_name="skill_gaps")
    op.drop_index(op.f("ix_skill_gaps_role_id"), table_name="skill_gaps")
    op.drop_table("skill_gaps")
