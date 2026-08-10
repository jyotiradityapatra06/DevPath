"""Enforce user skill and roadmap progress integrity.

Revision ID: 20260810_0008
Revises: 20260809_0007
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260810_0008"
down_revision: str | None = "20260809_0007"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Keep the most recently inserted row for each logical record before
    # enforcing uniqueness on databases that already contain duplicates.
    op.execute(
        sa.text(
            """
            DELETE FROM user_skills
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY user_id, skill_id ORDER BY id DESC
                    ) AS duplicate_number
                    FROM user_skills
                ) AS ranked_user_skills
                WHERE duplicate_number > 1
            )
            """
        )
    )
    op.execute(
        sa.text(
            """
            DELETE FROM progress
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT id, ROW_NUMBER() OVER (
                        PARTITION BY user_id, step_id ORDER BY id DESC
                    ) AS duplicate_number
                    FROM progress
                ) AS ranked_progress
                WHERE duplicate_number > 1
            )
            """
        )
    )

    op.create_unique_constraint(
        "uq_user_skills_user_skill", "user_skills", ["user_id", "skill_id"]
    )
    op.create_unique_constraint(
        "uq_progress_user_step", "progress", ["user_id", "step_id"]
    )
    op.create_index(op.f("ix_user_skills_user_id"), "user_skills", ["user_id"])
    op.create_index(op.f("ix_user_skills_skill_id"), "user_skills", ["skill_id"])
    op.create_index(op.f("ix_progress_user_id"), "progress", ["user_id"])
    op.create_index(op.f("ix_progress_step_id"), "progress", ["step_id"])
    op.create_index(
        op.f("ix_roadmaps_career_goal_id"), "roadmaps", ["career_goal_id"]
    )
    op.create_index(
        op.f("ix_roadmap_steps_roadmap_id"), "roadmap_steps", ["roadmap_id"]
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_roadmap_steps_roadmap_id"), table_name="roadmap_steps")
    op.drop_index(op.f("ix_roadmaps_career_goal_id"), table_name="roadmaps")
    op.drop_index(op.f("ix_progress_step_id"), table_name="progress")
    op.drop_index(op.f("ix_progress_user_id"), table_name="progress")
    op.drop_index(op.f("ix_user_skills_skill_id"), table_name="user_skills")
    op.drop_index(op.f("ix_user_skills_user_id"), table_name="user_skills")
    op.drop_constraint("uq_progress_user_step", "progress", type_="unique")
    op.drop_constraint("uq_user_skills_user_skill", "user_skills", type_="unique")
