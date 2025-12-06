"""
Quick seed script to add sample trails near Boston for testing.
Run with: python scripts/quick_seed.py
"""
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Set database URL
os.environ['DATABASE_URL'] = 'postgresql://demo:TPsg84210@localhost:5433/hiking_demo'

from app import create_app
from app.extensions import db
from app.models.trail import Trail
from geoalchemy2 import WKTElement

def seed_trails():
    app = create_app()
    with app.app_context():
        # Check if trails already exist
        existing_count = Trail.query.count()
        if existing_count > 0:
            print(f"⚠️  Database already has {existing_count} trails. Skipping seed.")
            return
        
        # Sample trails near Boston
        trails_data = [
            {
                "name": "Blue Hills Skyline Trail",
                "location": "Milton, MA",
                "length_miles": 5.2,
                "elevation_gain_ft": 850,
                "difficulty": 2,
                "description": "Scenic ridge trail with panoramic views of Boston skyline and the Atlantic Ocean",
                # Coordinates near Milton
                "geom": "LINESTRING(-71.1 42.2, -71.09 42.21, -71.08 42.22, -71.07 42.23)"
            },
            {
                "name": "Middlesex Fells Skyline Trail",
                "location": "Medford, MA",
                "length_miles": 6.8,
                "elevation_gain_ft": 1350,
                "difficulty": 3,
                "description": "Challenging loop through rocky terrain with excellent views",
                # Coordinates near Medford
                "geom": "LINESTRING(-71.1 42.45, -71.09 42.46, -71.08 42.47, -71.07 42.48)"
            },
            {
                "name": "Stony Brook Valley Trail",
                "location": "Boston, MA",
                "length_miles": 3.1,
                "elevation_gain_ft": 200,
                "difficulty": 1,
                "description": "Easy wooded trail perfect for families, follows Stony Brook through forest",
                # Coordinates in Boston
                "geom": "LINESTRING(-71.12 42.28, -71.11 42.29, -71.10 42.30, -71.09 42.31)"
            },
            {
                "name": "Walden Pond Loop",
                "location": "Concord, MA",
                "length_miles": 1.7,
                "elevation_gain_ft": 50,
                "difficulty": 1,
                "description": "Historic trail around Thoreau's famous pond, easy walk through woods",
                # Coordinates near Concord
                "geom": "LINESTRING(-71.34 42.44, -71.33 42.43, -71.32 42.42, -71.31 42.41)"
            }
        ]
        
        print("🌲 Seeding trail data...")
        
        for data in trails_data:
            geom_text = data.pop("geom")
            trail = Trail(**data)
            trail.geom = WKTElement(geom_text, srid=4326)
            db.session.add(trail)
            print(f"   Added: {trail.name}")
        
        db.session.commit()
        print(f"✅ Successfully seeded {len(trails_data)} trails!")
        
        # Verify
        total = Trail.query.count()
        print(f"📊 Total trails in database: {total}")

if __name__ == "__main__":
    seed_trails()
