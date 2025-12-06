from flask import Blueprint, jsonify, request

from app.extensions import db
from app.middleware import login_required, validate_user_input
from app.models.trail import Trail
from app.models.user import User

fav_bp = Blueprint("fav_bp", __name__, url_prefix="/api/favorites")


@fav_bp.route("/", methods=["GET"])
@login_required
def get_favorites(current_user=None):
    """
    Get all favorite trails for the current authenticated user.
    Requires authentication.
    """
    favs = [trail.serialize() for trail in current_user.favorited_trails]
    return jsonify(favorites=favs, count=len(favs)), 200


@fav_bp.route("/", methods=["POST"])
@login_required
@validate_user_input(["trail_id"])
def add_favorite(current_user=None):
    """
    Add a trail to the user's favorites.
    Requires authentication.
    """
    data = request.get_json()
    trail_id = data.get("trail_id")

    # Check if trail exists
    trail = Trail.query.get(trail_id)
    if not trail:
        return jsonify(message="Trail not found"), 404

    # Check if already favorited
    if trail in current_user.favorited_trails:
        return jsonify(message="Trail already in favorites"), 409

    # Add to favorites
    current_user.favorited_trails.append(trail)
    db.session.commit()

    return jsonify(message="Favorite added", trail=trail.serialize()), 201


@fav_bp.route("/<int:trail_id>", methods=["DELETE"])
@login_required
def remove_favorite(trail_id, current_user=None):
    """
    Remove a trail from the user's favorites.
    Requires authentication.
    """
    trail = Trail.query.get(trail_id)
    if not trail:
        return jsonify(message="Trail not found"), 404

    if trail in current_user.favorited_trails:
        current_user.favorited_trails.remove(trail)
        db.session.commit()
        return jsonify(message="Favorite removed"), 200

    return jsonify(message="Trail not in favorites"), 404
