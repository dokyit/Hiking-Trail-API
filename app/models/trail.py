from geoalchemy2 import Geometry

from app.extensions import db


class Trail(db.Model):
    """
    Trail model. This table should be populated from the raw
    'trails_raw' table ingested in Part 1.
    """

    __tablename__ = "trails"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    location = db.Column(db.String(255))
    length_miles = db.Column(db.Float)
    elevation_gain_ft = db.Column(db.Float)
    description = db.Column(db.Text)

    # Programmatically determined difficulty (1-4)
    difficulty = db.Column(db.Integer)

    # The PostGIS geometry column
    # SRID 4326 is the standard for WGS84 (lat/lng)
    geom = db.Column(Geometry(geometry_type="LINESTRING", srid=4326))

    def calculate_estimated_time(self):
        """
        Calculate estimated hiking time in minutes based on Naismith's Rule:
        - Base time: 3 mph (20 min/mile on flat terrain)
        - Add time for elevation: 30 min per 1000 ft of elevation gain
        - Adjust for difficulty: Easy (1.0x), Moderate (1.1x), Hard (1.3x), Extremely Hard (1.5x)
        """
        if not self.length_miles:
            return None

        # Base time: 20 minutes per mile
        base_time = self.length_miles * 20

        # Add time for elevation gain (30 min per 1000 ft)
        elevation_time = 0
        if self.elevation_gain_ft:
            elevation_time = (self.elevation_gain_ft / 1000) * 30

        # Difficulty multiplier
        difficulty_multipliers = {
            1: 1.0,  # Easy
            2: 1.1,  # Moderate
            3: 1.3,  # Hard
            4: 1.5,  # Extremely Hard
        }
        multiplier = difficulty_multipliers.get(self.difficulty, 1.0)

        total_time = (base_time + elevation_time) * multiplier
        return round(total_time)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "length_miles": self.length_miles,
            "elevation_gain_ft": self.elevation_gain_ft,
            "description": self.description,
            "difficulty": self.difficulty,
            "estimated_time_minutes": self.calculate_estimated_time(),
            # Note: Geometry is not serialized by default
        }
