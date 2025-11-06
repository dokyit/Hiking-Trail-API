from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from app.extensions import db, migrate, cache, jwt, bcrypt
from app.config import Config
from app.api import auth_bp, trail_bp, fav_bp, weather_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Add ProxyFix middleware to handle proxy headers correctly
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

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
