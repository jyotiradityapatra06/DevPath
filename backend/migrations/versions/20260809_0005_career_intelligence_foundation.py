"""Add learning resources and roadmap intelligence fields.

Revision ID: 20260809_0005
Revises: 20260809_0004
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260809_0005"
down_revision: str | None = "20260809_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "learning_resources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("provider", sa.String(length=100), nullable=False),
        sa.Column("resource_type", sa.String(length=50), nullable=False),
        sa.Column("url", sa.String(length=2048), nullable=False),
        sa.Column("difficulty", sa.String(length=50), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("skill_id", "title", "url", name="uq_resource_skill_title_url"),
    )
    op.create_index(op.f("ix_learning_resources_skill_id"), "learning_resources", ["skill_id"])

    op.alter_column("career_goals", "role_id", new_column_name="target_role_id")
    op.drop_index(op.f("ix_career_goals_role_id"), table_name="career_goals")
    op.create_index(op.f("ix_career_goals_target_role_id"), "career_goals", ["target_role_id"])
    op.add_column("career_goals", sa.Column("experience_level", sa.String(length=50), nullable=True))
    op.add_column("career_goals", sa.Column("target_duration", sa.String(length=50), nullable=True))

    op.add_column("roadmap_steps", sa.Column("skill_id", sa.Integer(), nullable=True))
    op.add_column("roadmap_steps", sa.Column("week_number", sa.Integer(), nullable=True))
    op.add_column("roadmap_steps", sa.Column("estimated_hours", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_roadmap_steps_skill_id"), "roadmap_steps", ["skill_id"])
    op.create_foreign_key("fk_roadmap_steps_skill_id", "roadmap_steps", "skills", ["skill_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_roadmap_steps_skill_id", "roadmap_steps", type_="foreignkey")
    op.drop_index(op.f("ix_roadmap_steps_skill_id"), table_name="roadmap_steps")
    op.drop_column("roadmap_steps", "estimated_hours")
    op.drop_column("roadmap_steps", "week_number")
    op.drop_column("roadmap_steps", "skill_id")
    op.drop_column("career_goals", "target_duration")
    op.drop_column("career_goals", "experience_level")
    op.drop_index(op.f("ix_career_goals_target_role_id"), table_name="career_goals")
    op.create_index(op.f("ix_career_goals_role_id"), "career_goals", ["target_role_id"])
    op.alter_column("career_goals", "target_role_id", new_column_name="role_id")
    op.drop_index(op.f("ix_learning_resources_skill_id"), table_name="learning_resources")
    op.drop_table("learning_resources")
