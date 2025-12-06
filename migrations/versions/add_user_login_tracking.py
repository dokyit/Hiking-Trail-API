"""Add user login tracking fields

Revision ID: add_user_login_tracking
Revises:
Create Date: 2024-01-15 00:00:00.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "add_user_login_tracking"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add new columns to users table
    op.add_column(
        "users",
        sa.Column(
            "created_at", sa.DateTime(), nullable=False, server_default=sa.text("NOW()")
        ),
    )
    op.add_column("users", sa.Column("last_login", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("last_ip", sa.String(length=45), nullable=True))
    op.add_column(
        "users", sa.Column("last_user_agent", sa.String(length=255), nullable=True)
    )


def downgrade():
    # Remove columns from users table
    op.drop_column("users", "last_user_agent")
    op.drop_column("users", "last_ip")
    op.drop_column("users", "last_login")
    op.drop_column("users", "created_at")
