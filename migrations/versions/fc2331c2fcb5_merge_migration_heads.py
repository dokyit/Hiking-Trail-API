"""merge migration heads

Revision ID: fc2331c2fcb5
Revises: 001_initial, add_user_login_tracking
Create Date: 2025-12-04 06:43:39.408992

"""
from alembic import op
import sqlalchemy as sa
import geoalchemy2


# revision identifiers, used by Alembic.
revision = 'fc2331c2fcb5'
down_revision = ('001_initial', 'add_user_login_tracking')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
