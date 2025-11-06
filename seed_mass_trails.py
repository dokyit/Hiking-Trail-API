"""
Seed script to populate Massachusetts hiking trails with placeholder data.
Run this script to add initial trail data to the database.

Usage: python seed_mass_trails.py
"""

from app import create_app
from app.extensions import db
from app.models.trail import Trail
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString


def calculate_difficulty(length_miles, elevation_gain_ft):
    """
    Calculate trail difficulty based on length and elevation gain.
    
    Difficulty levels:
    1 = Easy: < 3 miles, < 500 ft elevation
    2 = Moderate: 3-6 miles OR 500-1500 ft elevation
    3 = Hard: 6-10 miles OR 1500-2500 ft elevation
    4 = Extremely Hard: > 10 miles OR > 2500 ft elevation
    """
    if length_miles < 3 and elevation_gain_ft < 500:
        return 1
    elif length_miles < 6 and elevation_gain_ft < 1500:
        return 2
    elif length_miles < 10 and elevation_gain_ft < 2500:
        return 3
    else:
        return 4


# Massachusetts Trail Data with realistic coordinates
MASS_TRAILS = [
    {
        "name": "Blue Hills Skyline Trail",
        "location": "Milton, MA",
        "length_miles": 5.2,
        "elevation_gain_ft": 850,
        "description": "A challenging loop trail featuring panoramic views of Boston from Great Blue Hill. Popular for hiking and trail running with rocky terrain.",
        "coordinates": [
            [-71.0833, 42.2000],
            [-71.0850, 42.2050],
            [-71.0900, 42.2100],
            [-71.0950, 42.2120],
            [-71.0920, 42.2080],
            [-71.0833, 42.2000],
        ],
    },
    {
        "name": "Mount Greylock Summit Trail",
        "location": "Adams, MA",
        "length_miles": 11.5,
        "elevation_gain_ft": 2850,
        "description": "Reach the highest peak in Massachusetts at 3,491 feet. Stunning views from the Veterans War Memorial Tower. Extremely challenging but rewarding hike.",
        "coordinates": [
            [-73.1658, 42.6378],
            [-73.1600, 42.6400],
            [-73.1550, 42.6450],
            [-73.1500, 42.6500],
            [-73.1450, 42.6520],
            [-73.1400, 42.6550],
        ],
    },
    {
        "name": "Walden Pond Loop Trail",
        "location": "Concord, MA",
        "length_miles": 1.7,
        "elevation_gain_ft": 100,
        "description": "Easy, scenic walk around the famous Walden Pond made famous by Henry David Thoreau. Perfect for families and nature lovers.",
        "coordinates": [
            [-71.3363, 42.4406],
            [-71.3380, 42.4420],
            [-71.3400, 42.4430],
            [-71.3410, 42.4415],
            [-71.3390, 42.4400],
            [-71.3363, 42.4406],
        ],
    },
    {
        "name": "Monument Mountain Trail",
        "location": "Great Barrington, MA",
        "length_miles": 3.1,
        "elevation_gain_ft": 750,
        "description": "Popular moderate hike with stunning views from Squaw Peak. Features interesting rock formations and historical significance.",
        "coordinates": [
            [-73.3372, 42.2381],
            [-73.3350, 42.2400],
            [-73.3330, 42.2420],
            [-73.3310, 42.2440],
            [-73.3300, 42.2450],
        ],
    },
    {
        "name": "Mount Tom State Reservation",
        "location": "Holyoke, MA",
        "length_miles": 4.5,
        "elevation_gain_ft": 1200,
        "description": "Moderate to hard hike with beautiful overlooks of the Connecticut River Valley. Well-maintained trails through diverse forest.",
        "coordinates": [
            [-72.6139, 42.2619],
            [-72.6150, 42.2640],
            [-72.6170, 42.2660],
            [-72.6190, 42.2680],
            [-72.6200, 42.2700],
        ],
    },
    {
        "name": "Parker River Wildlife Refuge Trail",
        "location": "Newburyport, MA",
        "length_miles": 2.0,
        "elevation_gain_ft": 50,
        "description": "Easy coastal trail through salt marshes and beaches. Excellent for bird watching and photography. Family-friendly.",
        "coordinates": [
            [-70.8117, 42.7744],
            [-70.8100, 42.7760],
            [-70.8080, 42.7780],
            [-70.8060, 42.7800],
        ],
    },
    {
        "name": "Mohawk Trail",
        "location": "Charlemont, MA",
        "length_miles": 8.3,
        "elevation_gain_ft": 1850,
        "description": "Historic scenic trail through the Berkshire Mountains with waterfalls and stunning vistas. Challenging terrain for experienced hikers.",
        "coordinates": [
            [-72.8781, 42.6281],
            [-72.8750, 42.6300],
            [-72.8700, 42.6320],
            [-72.8650, 42.6340],
            [-72.8600, 42.6360],
            [-72.8550, 42.6380],
        ],
    },
    {
        "name": "Cape Cod Rail Trail",
        "location": "Dennis to Wellfleet, MA",
        "length_miles": 25.5,
        "elevation_gain_ft": 150,
        "description": "Long, flat paved trail perfect for hiking, biking, and running. Passes through charming Cape Cod towns and natural areas.",
        "coordinates": [
            [-70.1744, 41.7369],
            [-70.1700, 41.7400],
            [-70.1650, 41.7450],
            [-70.1600, 41.7500],
            [-70.1550, 41.7550],
            [-70.1500, 41.7600],
            [-70.1450, 41.7650],
            [-70.1400, 41.7700],
        ],
    },
    {
        "name": "Bash Bish Falls Trail",
        "location": "Mount Washington, MA",
        "length_miles": 1.5,
        "elevation_gain_ft": 400,
        "description": "Short but steep trail to Massachusetts' highest waterfall. Spectacular scenery with cascading 60-foot waterfall.",
        "coordinates": [
            [-73.4972, 42.1161],
            [-73.4950, 42.1180],
            [-73.4930, 42.1200],
            [-73.4910, 42.1220],
        ],
    },
    {
        "name": "Middlesex Fells Skyline Trail",
        "location": "Medford, MA",
        "length_miles": 6.8,
        "elevation_gain_ft": 1350,
        "description": "Challenging loop through rocky terrain with multiple peaks and scenic overlooks. Popular with Boston-area hikers.",
        "coordinates": [
            [-71.0953, 42.4569],
            [-71.0970, 42.4590],
            [-71.0990, 42.4610],
            [-71.1010, 42.4630],
            [-71.1030, 42.4650],
            [-71.1000, 42.4600],
            [-71.0953, 42.4569],
        ],
    },
    {
        "name": "Wachusett Mountain Trail",
        "location": "Princeton, MA",
        "length_miles": 3.5,
        "elevation_gain_ft": 1100,
        "description": "Moderate climb to the summit of Wachusett Mountain with 360-degree views. Well-marked trails and visitor center.",
        "coordinates": [
            [-71.8850, 42.5000],
            [-71.8830, 42.5020],
            [-71.8810, 42.5040],
            [-71.8790, 42.5060],
            [-71.8770, 42.5080],
        ],
    },
    {
        "name": "Halibut Point State Park Trail",
        "location": "Rockport, MA",
        "length_miles": 1.2,
        "elevation_gain_ft": 80,
        "description": "Easy coastal walk with dramatic ocean views and historic granite quarry. Perfect for families and photographers.",
        "coordinates": [
            [-70.6203, 42.6881],
            [-70.6220, 42.6900],
            [-70.6240, 42.6920],
            [-70.6250, 42.6930],
        ],
    },
    {
        "name": "October Mountain State Forest Trail",
        "location": "Lee, MA",
        "length_miles": 12.5,
        "elevation_gain_ft": 2400,
        "description": "Extensive backcountry trail system through Massachusetts' largest state forest. Remote and challenging, ideal for experienced hikers.",
        "coordinates": [
            [-73.2344, 42.3406],
            [-73.2300, 42.3430],
            [-73.2250, 42.3460],
            [-73.2200, 42.3490],
            [-73.2150, 42.3520],
            [-73.2100, 42.3550],
            [-73.2050, 42.3580],
        ],
    },
    {
        "name": "Purgatory Chasm Loop",
        "location": "Sutton, MA",
        "length_miles": 1.0,
        "elevation_gain_ft": 250,
        "description": "Unique geological formation with dramatic rock formations and narrow passages. Short but physically demanding trail.",
        "coordinates": [
            [-71.7103, 42.1231],
            [-71.7120, 42.1250],
            [-71.7140, 42.1270],
            [-71.7130, 42.1260],
            [-71.7103, 42.1231],
        ],
    },
    {
        "name": "Northfield Mountain Trail",
        "location": "Northfield, MA",
        "length_miles": 7.2,
        "elevation_gain_ft": 1600,
        "description": "Hard trail with steep climbs rewarded by panoramic views of the Connecticut River Valley and Vermont mountains.",
        "coordinates": [
            [-72.4453, 42.6672],
            [-72.4430, 42.6690],
            [-72.4400, 42.6710],
            [-72.4370, 42.6730],
            [-72.4340, 42.6750],
        ],
    },
    {
        "name": "Maudslay State Park Trail",
        "location": "Newburyport, MA",
        "length_miles": 2.8,
        "elevation_gain_ft": 120,
        "description": "Easy trails through historic estate gardens and along the Merrimack River. Beautiful in all seasons, especially during spring blooms.",
        "coordinates": [
            [-70.9533, 42.7936],
            [-70.9550, 42.7950],
            [-70.9570, 42.7970],
            [-70.9590, 42.7990],
        ],
    },
    {
        "name": "Mount Watatic Trail",
        "location": "Ashburnham, MA",
        "length_miles": 3.6,
        "elevation_gain_ft": 980,
        "description": "Moderate hike with rewarding summit views stretching to Boston and Mount Monadnock. Rocky terrain with fire tower at top.",
        "coordinates": [
            [-71.9000, 42.6800],
            [-71.8980, 42.6820],
            [-71.8960, 42.6840],
            [-71.8940, 42.6860],
        ],
    },
    {
        "name": "Nickerson State Park Trail",
        "location": "Brewster, MA",
        "length_miles": 4.0,
        "elevation_gain_ft": 100,
        "description": "Easy loop around freshwater kettle ponds. Great for families, swimming, and nature observation on Cape Cod.",
        "coordinates": [
            [-70.0217, 41.7806],
            [-70.0200, 41.7820],
            [-70.0180, 41.7840],
            [-70.0160, 41.7860],
            [-70.0140, 41.7880],
        ],
    },
    {
        "name": "Beartown State Forest Trail",
        "location": "Monterey, MA",
        "length_miles": 9.5,
        "elevation_gain_ft": 1900,
        "description": "Challenging wilderness trail through remote forest with pristine Benedict Pond. Backcountry camping available.",
        "coordinates": [
            [-73.2033, 42.1978],
            [-73.2000, 42.2000],
            [-73.1970, 42.2020],
            [-73.1940, 42.2040],
            [-73.1910, 42.2060],
            [-73.1880, 42.2080],
        ],
    },
    {
        "name": "Stony Brook Valley Trail",
        "location": "Norfolk, MA",
        "length_miles": 2.5,
        "elevation_gain_ft": 180,
        "description": "Easy family-friendly trail along a scenic brook with wooden bridges and abundant wildlife. Great for beginners.",
        "coordinates": [
            [-71.3250, 42.1167],
            [-71.3270, 42.1180],
            [-71.3290, 42.1200],
            [-71.3310, 42.1220],
        ],
    },
]


def seed_trails():
    """Seed the database with Massachusetts trail data."""
    app = create_app()

    with app.app_context():
        # Clear existing trails (optional - comment out if you want to keep existing data)
        print("Clearing existing trail data...")
        Trail.query.delete()
        db.session.commit()

        print(f"Seeding {len(MASS_TRAILS)} Massachusetts trails...")

        for trail_data in MASS_TRAILS:
            # Calculate difficulty
            difficulty = calculate_difficulty(
                trail_data["length_miles"], trail_data["elevation_gain_ft"]
            )

            # Create LineString geometry from coordinates
            line = LineString(trail_data["coordinates"])
            geom = from_shape(line, srid=4326)

            # Create trail object
            trail = Trail(
                name=trail_data["name"],
                location=trail_data["location"],
                length_miles=trail_data["length_miles"],
                elevation_gain_ft=trail_data["elevation_gain_ft"],
                description=trail_data["description"],
                difficulty=difficulty,
                geom=geom,
            )

            db.session.add(trail)
            print(f"  ✓ Added: {trail_data['name']} - Difficulty: {difficulty}")

        # Commit all trails
        db.session.commit()
        print(f"\n✓ Successfully seeded {len(MASS_TRAILS)} trails!")


if __name__ == "__main__":
    seed_trails()
