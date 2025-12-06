from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity

from app.extensions import bcrypt, db
from app.middleware import (
    get_client_ip,
    get_user_agent,
    login_required,
    rate_limit_by_user,
    track_login_activity,
    validate_user_input,
)
from app.models.user import User
from app.utils.validators import (
    sanitize_string,
    validate_email,
    validate_password,
    validate_username,
)

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
@validate_user_input(["username", "email", "password"])
def register_user():
    """
    Register a new user account.
    Stores user info in database with hashed password.
    Enforces strong password requirements and input validation.
    """
    data = request.get_json()
    username = sanitize_string(data.get("username", ""), max_length=80)
    email = sanitize_string(data.get("email", ""), max_length=120)
    password = data.get("password", "")  # Don't sanitize passwords

    # Validate username
    is_valid, error = validate_username(username)
    if not is_valid:
        return jsonify(message=error), 400
    
    # Validate email
    is_valid, error = validate_email(email)
    if not is_valid:
        return jsonify(message=error), 400
    
    # Validate password strength (8+ chars, mixed case, numbers)
    is_valid, error = validate_password(password)
    if not is_valid:
        return jsonify(message=error), 400

    # Check for existing users
    if User.query.filter_by(username=username).first():
        return jsonify(message="Username already exists"), 409
    if User.query.filter_by(email=email).first():
        return jsonify(message="Email already exists"), 409

    # Create new user
    new_user = User(username=username, email=email)
    new_user.set_password(password)

    # Track registration info
    new_user.last_ip = get_client_ip()
    new_user.last_user_agent = get_user_agent()

    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User created successfully", user=new_user.serialize()), 201


@auth_bp.route("/login", methods=["POST"])
@validate_user_input(["username", "password"])
def login_user():
    """
    Authenticate user and return JWT access token.
    Tracks login timestamp, IP address, and user agent in database.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    # Find user by username
    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        # Track login activity
        track_login_activity(user.id)

        # Create JWT token
        access_token = create_access_token(identity=user.id)

        return jsonify(
            access_token=access_token, user=user.serialize(), message="Login successful"
        ), 200

    return jsonify(message="Invalid credentials"), 401


@auth_bp.route("/me", methods=["GET"])
@login_required
def get_current_user_info(current_user=None):
    """
    Get current authenticated user's information.
    Protected route - requires valid JWT token.
    """
    return jsonify(user=current_user.serialize()), 200


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout_user(current_user=None):
    """
    Logout current user.
    Note: JWT tokens are stateless, so this is mainly for client-side cleanup.
    In production, consider implementing a token blacklist with Redis.
    """
    return jsonify(
        message="Logout successful. Please remove token from client.",
        user=current_user.serialize(),
    ), 200
