"""
Authentication middleware for protecting routes and tracking user sessions.

This module provides decorators and utilities for:
- Requiring authentication on protected routes
- Optional authentication (checking if user is logged in but not requiring it)
- Extracting user information from JWT tokens
- Logging user activity and login information
"""

from functools import wraps

from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from flask_jwt_extended.exceptions import NoAuthorizationError

from app.extensions import db
from app.models.user import User


def get_client_ip():
    """
    Get the client's IP address from the request.
    Handles proxies and load balancers.
    """
    if request.headers.get("X-Forwarded-For"):
        # If behind a proxy, get the original IP
        return request.headers.get("X-Forwarded-For").split(",")[0].strip()
    elif request.headers.get("X-Real-IP"):
        return request.headers.get("X-Real-IP")
    else:
        return request.remote_addr


def get_user_agent():
    """Get the user's browser/client user agent string."""
    return request.headers.get("User-Agent", "Unknown")


def get_current_user():
    """
    Get the current authenticated user from the JWT token.
    Returns None if no valid token is present.
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id:
            return User.query.get(user_id)
    except (NoAuthorizationError, Exception):
        pass
    return None


def login_required(f):
    """
    Decorator to protect routes that require authentication.

    Usage:
        @app.route('/protected')
        @login_required
        def protected_route():
            return jsonify(message="You are logged in!")

    Returns 401 if user is not authenticated.
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()

            if not user_id:
                return jsonify(message="Authentication required"), 401

            # Get user from database
            user = User.query.get(user_id)
            if not user:
                return (
                    jsonify(message="User not found. Please login again."),
                    401,
                )

            # Add user to kwargs so the route can access it
            kwargs["current_user"] = user

            return f(*args, **kwargs)

        except NoAuthorizationError:
            return jsonify(message="Invalid or missing authentication token"), 401
        except Exception as e:
            return jsonify(message=f"Authentication error: {str(e)}"), 401

    return decorated_function


def optional_login(f):
    """
    Decorator for routes where authentication is optional.
    If user is authenticated, their info will be available.
    If not authenticated, the route still executes normally.

    Usage:
        @app.route('/optional')
        @optional_login
        def optional_route(current_user=None):
            if current_user:
                return jsonify(message=f"Hello {current_user.username}")
            return jsonify(message="Hello guest")
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        kwargs["current_user"] = user
        return f(*args, **kwargs)

    return decorated_function


def admin_required(f):
    """
    Decorator to protect routes that require admin privileges.
    First checks if user is authenticated, then checks if they are an admin.

    Usage:
        @app.route('/admin')
        @admin_required
        def admin_route():
            return jsonify(message="Admin access granted")

    Note: Requires adding an 'is_admin' field to the User model.
    """

    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()

            if not user_id:
                return jsonify(message="Authentication required"), 401

            user = User.query.get(user_id)
            if not user:
                return jsonify(message="User not found"), 401

            # Check if user has admin privileges
            # Note: You'll need to add an 'is_admin' field to User model
            if not getattr(user, "is_admin", False):
                return (
                    jsonify(message="Admin privileges required"),
                    403,
                )

            kwargs["current_user"] = user
            return f(*args, **kwargs)

        except NoAuthorizationError:
            return jsonify(message="Invalid or missing authentication token"), 401
        except Exception as e:
            return jsonify(message=f"Authentication error: {str(e)}"), 401

    return decorated_function


def track_login_activity(user_id):
    """
    Track user login activity by updating last login timestamp and IP.

    Args:
        user_id: The ID of the user who just logged in

    Returns:
        The updated User object
    """
    user = User.query.get(user_id)
    if user:
        ip_address = get_client_ip()
        user_agent = get_user_agent()
        user.update_login_info(ip_address=ip_address, user_agent=user_agent)
        db.session.commit()
    return user


def validate_user_input(required_fields):
    """
    Decorator to validate that required fields are present in request JSON.

    Usage:
        @app.route('/create', methods=['POST'])
        @validate_user_input(['username', 'email', 'password'])
        def create_user():
            data = request.get_json()
            # All required fields are guaranteed to be present
            return jsonify(message="User created")

    Args:
        required_fields: List of field names that must be present in JSON
    """

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()

            if not data:
                return jsonify(message="Request body must be JSON"), 400

            missing_fields = [field for field in required_fields if field not in data]

            if missing_fields:
                return (
                    jsonify(
                        message=f"Missing required fields: {', '.join(missing_fields)}"
                    ),
                    400,
                )

            return f(*args, **kwargs)

        return decorated_function

    return decorator


def rate_limit_by_user(max_requests=100, window_seconds=3600):
    """
    Simple in-memory rate limiter per user (for demonstration).
    In production, use Redis or a proper rate limiting library.

    Args:
        max_requests: Maximum number of requests allowed
        window_seconds: Time window in seconds

    Usage:
        @app.route('/api/data')
        @login_required
        @rate_limit_by_user(max_requests=50, window_seconds=3600)
        def get_data(current_user=None):
            return jsonify(data="...")
    """
    from collections import defaultdict
    from time import time

    # Simple in-memory storage (use Redis in production)
    request_counts = defaultdict(list)

    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user = kwargs.get("current_user")

            if not current_user:
                return jsonify(message="Authentication required for rate limiting"), 401

            user_id = current_user.id
            now = time()

            # Clean up old requests outside the time window
            request_counts[user_id] = [
                req_time
                for req_time in request_counts[user_id]
                if now - req_time < window_seconds
            ]

            # Check if user has exceeded rate limit
            if len(request_counts[user_id]) >= max_requests:
                return (
                    jsonify(
                        message=f"Rate limit exceeded. Try again in {window_seconds} seconds."
                    ),
                    429,
                )

            # Add current request timestamp
            request_counts[user_id].append(now)

            return f(*args, **kwargs)

        return decorated_function

    return decorator
