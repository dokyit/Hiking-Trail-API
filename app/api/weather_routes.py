import requests
from flask import Blueprint, request, jsonify
from app.extensions import cache
from app.config import Config

weather_bp = Blueprint("weather_bp", __name__, url_prefix="/api")


@weather_bp.route("/weather", methods=["GET"], strict_slashes=False)
@cache.cached(timeout=1800, query_string=True)  # Cache weather for 30 minutes
def get_weather():
    city = request.args.get("city")
    if not city:
        return jsonify(message="City parameter is required"), 400

    params = {"access_key": Config.WEATHERSTACK_KEY, "query": city}

    try:
        response = requests.get("http://api.weatherstack.com/current", params=params)
        response.raise_for_status()
        data = response.json()

        if data.get("current"):
            current_weather = data["current"]
            weather_data = {
                "temperature": current_weather.get("temperature"),
                "description": current_weather.get("weather_descriptions", [None])[0],
                "icon_url": current_weather.get("weather_icons", [None])[0],
            }
            return jsonify(weather_data), 200
        else:
            return jsonify(message="Weather data not found"), 404

    except requests.RequestException as e:
        return jsonify(message=f"Error fetching weather: {str(e)}"), 500
