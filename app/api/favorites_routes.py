from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.trail import Trail
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity

fav_bp = Blueprint("fav_bp", __name__, url_prefix="/api/favorites")


@fav_bp.route("/", methods=["GET"])
@jwt_required()
def get_favorites():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    favs = [trail.serialize() for trail in user.favorited_trails]
    return jsonify(favorites=favs), 200


@fav_bp.route("/", methods=["POST"])
@jwt_required()
def add_favorite():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    data = request.get_json()
    trail_id = data.get("trail_id")

    trail = Trail.query.get(trail_id)
    if not trail:
        return jsonify(message="Trail not found"), 404

    user.favorited_trails.append(trail)
    db.session.commit()

    return jsonify(message="Favorite added"), 201


@fav_bp.route("/<int:trail_id>", methods=["DELETE"])
@jwt_required()
def remove_favorite(trail_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    trail = Trail.query.get(trail_id)
    if not trail:
        return jsonify(message="Trail not found"), 404

    if trail in user.favorited_trails:
        user.favorited_trails.remove(trail)
        db.session.commit()
        return jsonify(message="Favorite removed"), 200

    return jsonify(message="Trail not in favorites"), 404
