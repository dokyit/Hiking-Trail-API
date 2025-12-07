import requests
from flask import Blueprint, jsonify, request
from geoalchemy2.functions import ST_AsGeoJSON, ST_DWithin, ST_MakePoint, ST_SetSRID

from app.config import Config
from app.extensions import cache, db
from app.models.trail import Trail
from app.utils.validators import sanitize_string, validate_city_name, validate_trail_id

# Fallback coordinates for common Massachusetts cities
# Used when Google Maps API is unavailable or invalid
FALLBACK_COORDS = {
    "boston": (42.3601, -71.0589),
    "cambridge": (42.3736, -71.1097),
    "worcester": (42.2626, -71.8023),
    "springfield": (42.1015, -72.5898),
    "salem": (42.5195, -70.8967),
    "lowell": (42.6334, -71.3162),
    "milton": (42.2496, -71.0662),
    "medford": (42.4184, -71.1062),
    "concord": (42.4604, -71.3489),
    "quincy": (42.2529, -71.0023),
}

trail_bp = Blueprint("trail_bp", __name__, url_prefix="/api/trails")


# --- Helper Functions ---
@cache.memoize(timeout=2592000)  # Cache for 30 days, keyed by arguments
def get_coordinates(city_name, api_key):
    """Geocodes a city name using Google Maps API."""
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {"address": f"{city_name}, MA", "key": api_key}
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()
        if data["status"] == "OK" and len(data["results"]) > 0:
            location = data["results"][0]["geometry"]["location"]
            return location["lat"], location["lng"]
    except requests.RequestException:
        pass
    return None, None


def get_difficulty_details(difficulty_rating):
    """Maps difficulty rating to text and necessity list."""
    difficulty_map = {1: "Easy", 2: "Moderate", 3: "Hard", 4: "Extremely Hard"}
    necessity_map = {
        1: [
            "Map/Navigation",
            "Water & Snacks",
            "Sun Protection",
            "Basic First-Aid Kit",
        ],
        2: [
            "Map/Navigation",
            "Water & Snacks",
            "Sun Protection",
            "Basic First-Aid Kit",
            "Rain Gear & Extra Layers",
            "Headlamp/Flashlight",
        ],
        3: [
            "Map/Navigation",
            "Water & Snacks",
            "Sun Protection",
            "Basic First-Aid Kit",
            "Rain Gear & Extra Layers",
            "Headlamp/Flashlight",
            "Fire Starter",
            "Knife/Multi-tool",
            "Emergency Shelter (e.g., bivy)",
        ],
        4: [
            "Map/Navigation",
            "Water & Snacks",
            "Sun Protection",
            "Basic First-Aid Kit",
            "Rain Gear & Extra Layers",
            "Headlamp/Flashlight",
            "Fire Starter",
            "Knife/Multi-tool",
            "Emergency Shelter (e.g., bivy)",
            "Extra Day's Rations",
            "Water Purification System",
            "Specialized Gear (e.g., microspikes, trekking poles)",
        ],
    }
    return difficulty_map.get(difficulty_rating, "Unknown"), necessity_map.get(
        difficulty_rating, []
    )


# --- ---


@trail_bp.route("/search", methods=["GET"], strict_slashes=False)
# @cache.cached(timeout=3600, query_string=True)  # Cache search results for 1 hour  # Commented out to avoid caching issues
def search_trails():
    city = request.args.get("city")

    # Check if city parameter is provided
    if not city:
        return jsonify(message="City parameter is required"), 400

    # Validate city name
    is_valid, error = validate_city_name(city)
    if not is_valid:
        return jsonify(message=error), 400

    # Sanitize city name
    city = sanitize_string(city, max_length=100)

    lat, lng = get_coordinates(city, Config.GOOGLE_MAPS_KEY)

    # Try fallback coordinates if geocoding fails
    if lat is None or lng is None:
        city_lower = city.lower().strip()
        if city_lower in FALLBACK_COORDS:
            lat, lng = FALLBACK_COORDS[city_lower]
            print(
                f"⚠️  Using fallback coordinates for {city} (Google Maps API unavailable)"
            )
        else:
            return jsonify(
                message=f"Could not find coordinates for '{city}'. Please check the spelling or try another Massachusetts city."
            ), 404

    # Default radius is 25 miles (approx. 0.36 degrees for planar distance)
    radius_deg = 0.36

    # The high-performance PostGIS query
    # Set SRID to 4326 to match the trails table geometry
    point = ST_SetSRID(ST_MakePoint(lng, lat), 4326)
    trails_query = db.session.query(Trail, ST_AsGeoJSON(Trail.geom)).filter(
        ST_DWithin(
            Trail.geom,
            point,
            radius_deg,
            use_spheroid=False,  # Use planar distance calculation
        )
    )

    results = []
    for trail, geom_json in trails_query.all():
        difficulty_text, _ = get_difficulty_details(trail.difficulty)
        trail_data = trail.serialize()
        trail_data["difficulty_text"] = difficulty_text
        trail_data["geometry"] = geom_json  # Include GeoJSON for map plotting
        results.append(trail_data)

    return jsonify(trails=results, map_center={"lat": lat, "lng": lng}), 200


@trail_bp.route("/<int:trail_id>", methods=["GET"], strict_slashes=False)
def get_trail_details(trail_id):
    # Validate trail ID
    is_valid, error = validate_trail_id(trail_id)
    if not is_valid:
        return jsonify(message=error), 400

    trail = Trail.query.get(trail_id)
    if not trail:
        return jsonify(message="Trail not found"), 404

    trail_data = trail.serialize()
    difficulty_text, necessity_list = get_difficulty_details(trail.difficulty)
    trail_data["difficulty_text"] = difficulty_text
    trail_data["necessity_list"] = necessity_list

    return jsonify(trail=trail_data), 200
