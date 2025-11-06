import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""

    # Secret key for signing session cookies and JWTs
    SECRET_KEY = os.environ.get("SECRET_KEY") or "a-very-hard-to-guess-secret"

    # JWT Secret Key
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt-super-secret"

    # Database Configuration
    # Support both DATABASE_URL and individual components
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_PORT = os.environ.get("DB_PORT", "5432")
    DB_NAME = os.environ.get("DB_NAME", "hiking_db")
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "your_password")

    # Construct DATABASE_URL from components if not provided directly
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Redis Cache Configuration
    # Support both REDIS_URL and individual components
    REDIS_HOST = os.environ.get("REDIS_HOST", "localhost")
    REDIS_PORT = os.environ.get("REDIS_PORT", "6379")
    REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", "")

    # Construct REDIS_URL from components if not provided directly
    if os.environ.get("REDIS_URL"):
        CACHE_REDIS_URL = os.environ.get("REDIS_URL")
    elif REDIS_PASSWORD:
        CACHE_REDIS_URL = f"redis://:{REDIS_PASSWORD}@{REDIS_HOST}:{REDIS_PORT}/0"
    else:
        CACHE_REDIS_URL = f"redis://{REDIS_HOST}:{REDIS_PORT}/0"

    CACHE_TYPE = "redis"
    CACHE_DEFAULT_TIMEOUT = 300  # Default cache timeout 5 minutes

    # External API Keys
    WEATHERSTACK_KEY = os.environ.get("WEATHERSTACK_KEY")
    GOOGLE_MAPS_KEY = os.environ.get("GOOGLE_MAPS_KEY")
