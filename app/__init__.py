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

    # --- Add this code block to enable PostGIS ---
    # This runs on app startup and ensures PostGIS is enabled
    # "IF NOT EXISTS" makes it safe to run every time.
    with app.app_context():
        from sqlalchemy import create_engine, text
        import os
        try:
            # We get the URL from the app's config
            # Use os.environ.get as a fallback if config isn't loaded yet
            db_url = app.config.get('SQLALCHEMY_DATABASE_URI') or os.environ.get('DATABASE_URL')
            if db_url:
                engine = create_engine(db_url)
                with engine.connect() as connection:
                    connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                    connection.commit()
                print("PostGIS extension checked/enabled.")
            else:
                print("DATABASE_URL not found, skipping PostGIS check.")
        except Exception as e:
            # We print the error, so it shows up in Render logs if it fails
            print(f"Error enabling PostGIS: {e}")
            pass
    # --- End of new code block ---

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(trail_bp)
    app.register_blueprint(fav_bp)
    app.register_blueprint(weather_bp)

    return app
