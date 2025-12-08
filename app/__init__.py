import os

from flask import Flask
from flask_cors import CORS
from werkzeug.middleware.proxy_fix import ProxyFix

from app.api import auth_bp, fav_bp, trail_bp, weather_bp
from app.config import Config
from app.extensions import bcrypt, cache, db, jwt, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Add ProxyFix middleware to handle proxy headers correctly
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

    # Enable CORS for frontend and optional desktop clients
    default_origins = {"http://localhost:3000"}
    electron_origin = os.environ.get("ELECTRON_RENDERER_ORIGIN")
    if electron_origin:
        default_origins.add(electron_origin)

    configured_origins = os.environ.get("CORS_ALLOWED_ORIGINS")
    if configured_origins:
        default_origins.update(
            origin.strip() for origin in configured_origins.split(",") if origin.strip()
        )

    default_origins.add("null")

    allowed_origins = sorted(default_origins)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
            }
        },
    )

    # Disable strict slashes to prevent redirects
    app.url_map.strict_slashes = False

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cache.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(trail_bp)
    app.register_blueprint(fav_bp)
    app.register_blueprint(weather_bp)

    return app
