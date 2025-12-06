#!/usr/bin/env bash
# exit on error
set -o errexit

echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Installing system dependencies for PostGIS..."
# These are usually pre-installed on Render

echo "Running database migrations..."
flask db upgrade

echo "Checking if trails need to be seeded..."
python -c "
from app import create_app, db
from app.models import Trail

app = create_app()
with app.app_context():
    count = Trail.query.count()
    if count == 0:
        print('No trails found, seeding database...')
        import subprocess
        print('No trails found, seeding database...')
        import subprocess
        subprocess.run(['python', 'scripts/import_massgis.py'])
    else:
        print(f'Database already has {count} trails')
"

echo "Build complete!"
