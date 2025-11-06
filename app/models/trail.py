from app.extensions import db
from geoalchemy2 import Geometry


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

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "length_miles": self.length_miles,
            "elevation_gain_ft": self.elevation_gain_ft,
            "description": self.description,
            "difficulty": self.difficulty,
            # Note: Geometry is not serialized by default
        }
