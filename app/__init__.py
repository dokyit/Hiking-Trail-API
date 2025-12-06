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

    # Enable CORS for frontend
    # For development - only allow localhost:3000
    # For production, add your deployment domain to this list:
    # ALLOWED_ORIGINS = ["https://your-app.com", "https://www.your-app.com"]
    ALLOWED_ORIGINS = ["http://localhost:3000"]
    
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": ALLOWED_ORIGINS,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
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
