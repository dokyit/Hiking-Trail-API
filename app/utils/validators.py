import re
import unicodedata
from typing import Tuple


def validate_email(email: str) -> Tuple[bool, str]:
    """
    Validate email format using RFC 5322 simplified regex.
    
    Args:
        email: Email address to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not email:
        return False, "Email is required"
    
    # RFC 5322 simplified regex
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(pattern, email):
        return False, "Invalid email format"
    
    if len(email) > 120:
        return False, "Email is too long"
    
    return True, ""


def validate_password(password: str) -> Tuple[bool, str]:
    """
    Validate password strength according to security requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    
    Args:
        password: Password to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not password:
        return False, "Password is required"
    
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number"
    
    # Optional: check for special characters
    # if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
    #     return False, "Password must contain at least one special character"
    
    return True, ""


def validate_username(username: str) -> Tuple[bool, str]:
    """
    Validate username format:
    - 3-80 characters
    - Alphanumeric and underscores only
    
    Args:
        username: Username to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not username:
        return False, "Username is required"
    
    if len(username) < 3:
        return False, "Username must be at least 3 characters"
    
    if len(username) > 80:
        return False, "Username is too long (max 80 characters)"
    
    if not re.match(r"^[a-zA-Z0-9_]+$", username):
        return False, "Username can only contain letters, numbers, and underscores"
    
    return True, ""


def validate_trail_id(trail_id) -> Tuple[bool, str]:
    """
    Validate trail ID is a positive integer.
    
    Args:
        trail_id: Trail ID to validate
        
    Returns:
        (is_valid, error_message)
    """
    try:
        tid = int(trail_id)
        if tid <= 0:
            return False, "Trail ID must be a positive number"
        return True, ""
    except (ValueError, TypeError):
        return False, "Trail ID must be a number"


def validate_city_name(city: str) -> Tuple[bool, str]:
    """
    Validate city name for geocoding.
    
    Args:
        city: City name to validate
        
    Returns:
        (is_valid, error_message)
    """
    if not city:
        return False, "City name is required"
    
    city = city.strip()
    
    if len(city) < 2:
        return False, "City name is too short"
    
    if len(city) > 100:
        return False, "City name is too long"
    
    # Allow letters, spaces, hyphens, apostrophes (e.g., "Martha's Vineyard", "North Adams")
    if not re.match(r"^[a-zA-Z\s\-']+$", city):
        return False, "City name contains invalid characters"
    
    return True, ""


def sanitize_string(text: str, max_length: int = 255) -> str:
    """
    Basic sanitization for user input:
    - Remove leading/trailing whitespace
    - Limit length
    - Remove control characters
    
    Args:
        text: String to sanitize
        max_length: Maximum allowed length
        
    Returns:
        Sanitized string
    """
    if not text:
        return ""
    
    # Remove leading/trailing whitespace
    text = text.strip()
    
    # Remove control characters
    text = "".join(ch for ch in text if unicodedata.category(ch)[0] != "C")
    
    # Limit length
    if len(text) > max_length:
        text = text[:max_length]
    
    return text
