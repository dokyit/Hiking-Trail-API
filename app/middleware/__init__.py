"""
Middleware package for authentication and request handling.

This module provides middleware decorators and utilities for:
- Authentication and authorization
- User session tracking
- Input validation
- Rate limiting
"""

from app.middleware.auth_middleware import (
    admin_required,
    get_client_ip,
    get_current_user,
    get_user_agent,
    login_required,
    optional_login,
    rate_limit_by_user,
    track_login_activity,
    validate_user_input,
)

__all__ = [
    "login_required",
    "optional_login",
    "admin_required",
    "get_current_user",
    "get_client_ip",
    "get_user_agent",
    "track_login_activity",
    "validate_user_input",
    "rate_limit_by_user",
]
