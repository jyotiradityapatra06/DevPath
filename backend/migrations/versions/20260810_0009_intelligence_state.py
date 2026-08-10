"""Track active derived intelligence state.

Revision ID: 20260810_0009
Revises: 20260810_0008
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260810_0009"
down_revision: str | None = "20260810_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "roadmaps",
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.add_column(
        "skill_gaps",
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.add_column(
        "personalized_recommendations",
        sa.Column("is_active", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.create_index(op.f("ix_roadmaps_is_active"), "roadmaps", ["is_active"])
    op.create_index(op.f("ix_skill_gaps_is_active"), "skill_gaps", ["is_active"])
    op.create_index(
        op.f("ix_personalized_recommendations_is_active"),
        "personalized_recommendations",
        ["is_active"],
    )

    # Existing recommendation rows already represent the latest generation because
    # earlier application versions replaced them. Normalize snapshot tables to one
    # active row per user, retaining all older rows as history.
    op.execute(sa.text("UPDATE roadmaps SET is_active = false"))
    op.execute(
        sa.text(
            """
            UPDATE roadmaps
            SET is_active = true
            WHERE id IN (
                SELECT MAX(roadmaps.id)
                FROM roadmaps
                JOIN career_goals ON career_goals.id = roadmaps.career_goal_id
                WHERE career_goals.user_id IS NOT NULL
                GROUP BY career_goals.user_id
            )
            """
        )
    )
    op.execute(sa.text("UPDATE skill_gaps SET is_active = false"))
    op.execute(
        sa.text(
            """
            UPDATE skill_gaps
            SET is_active = true
            WHERE id IN (
                SELECT MAX(id) FROM skill_gaps GROUP BY user_id
            )
            """
        )
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_personalized_recommendations_is_active"),
        table_name="personalized_recommendations",
    )
    op.drop_index(op.f("ix_skill_gaps_is_active"), table_name="skill_gaps")
    op.drop_index(op.f("ix_roadmaps_is_active"), table_name="roadmaps")
    op.drop_column("personalized_recommendations", "is_active")
    op.drop_column("skill_gaps", "is_active")
    op.drop_column("roadmaps", "is_active")
