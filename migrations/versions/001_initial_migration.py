"""Initial migration

Revision ID: 001_initial
Revises:
Create Date: 2025-11-05 12:00:00.000000

"""

from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision = "001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=120), nullable=False),
        sa.Column("password_hash", sa.String(length=128), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("username"),
    )

    # Create trails table
    op.create_table(
        "trails",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("length_miles", sa.Float(), nullable=True),
        sa.Column("elevation_gain_ft", sa.Float(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.Integer(), nullable=True),
        sa.Column(
            "geom",
            geoalchemy2.types.Geometry(
                geometry_type="LINESTRING",
                srid=4326,
                from_text="ST_GeomFromEWKT",
                name="geometry",
            ),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create favorites table
    op.create_table(
        "favorites",
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("trail_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["trail_id"],
            ["trails.id"],
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
        ),
        sa.PrimaryKeyConstraint("user_id", "trail_id"),
    )


def downgrade():
    op.drop_table("favorites")
    op.drop_table("trails")
    op.drop_table("users")
