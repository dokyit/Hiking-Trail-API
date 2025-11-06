from flask import Blueprint, request, jsonify
from app.models.user import User
from app.extensions import db, bcrypt
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register_user():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify(message="Username already exists"), 409
    if User.query.filter_by(email=email).first():
        return jsonify(message="Email already exists"), 409

    new_user = User(username=username, email=email)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User created successfully"), 201


@auth_bp.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200

    return jsonify(message="Invalid credentials"), 401
