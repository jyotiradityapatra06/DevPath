"""Add the skill intelligence engine tables and fields.

Revision ID: 20260809_0002
Revises: 7b12d21f4c89
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260809_0002"
down_revision: str | None = "7b12d21f4c89"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("skills", sa.Column("difficulty", sa.String(length=50), nullable=True))
    op.add_column("skills", sa.Column("description", sa.Text(), nullable=True))
    op.add_column(
        "skills",
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("title"),
    )
    op.create_table(
        "role_skills",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.Column("skill_id", sa.Integer(), nullable=False),
        sa.Column("importance", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("importance BETWEEN 0 AND 100", name="ck_role_skills_importance"),
        sa.ForeignKeyConstraint(["role_id"], ["roles.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["skill_id"], ["skills.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("role_id", "skill_id", name="uq_role_skills_role_skill"),
    )
    op.create_index(op.f("ix_role_skills_role_id"), "role_skills", ["role_id"])
    op.create_index(op.f("ix_role_skills_skill_id"), "role_skills", ["skill_id"])
    op.add_column("career_goals", sa.Column("role_id", sa.Integer(), nullable=True))
    op.create_index(op.f("ix_career_goals_role_id"), "career_goals", ["role_id"])
    op.create_foreign_key("fk_career_goals_role_id", "career_goals", "roles", ["role_id"], ["id"])


def downgrade() -> None:
    op.drop_constraint("fk_career_goals_role_id", "career_goals", type_="foreignkey")
    op.drop_index(op.f("ix_career_goals_role_id"), table_name="career_goals")
    op.drop_column("career_goals", "role_id")
    op.drop_index(op.f("ix_role_skills_skill_id"), table_name="role_skills")
    op.drop_index(op.f("ix_role_skills_role_id"), table_name="role_skills")
    op.drop_table("role_skills")
    op.drop_table("roles")
    op.drop_column("skills", "created_at")
    op.drop_column("skills", "description")
    op.drop_column("skills", "difficulty")
