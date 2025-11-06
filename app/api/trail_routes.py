import requests
from flask import Blueprint, request, jsonify
from app.models.trail import Trail
from app.extensions import db, cache
from geoalchemy2.functions import ST_DWithin, ST_MakePoint, ST_AsGeoJSON, ST_SetSRID
from app.config import Config

trail_bp = Blueprint("trail_bp", __name__, url_prefix="/api/trails")


# --- Helper Functions ---
@cache.cached(timeout=2592000, key_prefix="geocode_")  # Cache for 30 days
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
    if not city:
        return jsonify(message="City parameter is required"), 400

    lat, lng = get_coordinates(city, Config.GOOGLE_MAPS_KEY)
    if lat is None or lng is None:
        # Temporary fix: Hardcode Boston coordinates if geocoding fails (due to invalid API key)
        lat, lng = 42.3601, -71.0589  # Boston, MA
        # return jsonify(message="Could not geocode city"), 404

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
    trail = Trail.query.get(trail_id)
    if not trail:
        return jsonify(message="Trail not found"), 404

    trail_data = trail.serialize()
    difficulty_text, necessity_list = get_difficulty_details(trail.difficulty)
    trail_data["difficulty_text"] = difficulty_text
    trail_data["necessity_list"] = necessity_list

    return jsonify(trail=trail_data), 200
