from flask import Flask
from werkzeug.middleware.proxy_fix import ProxyFix
from app.extensions import db, migrate, cache, jwt, bcrypt
from app.config import Config
from app.api import auth_bp, trail_bp, fav_bp, weather_bp

# New imports for our setup logic
import os
import subprocess
from sqlalchemy import create_engine, text
from flask_migrate import upgrade


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
    
    # --- New Setup Block (No-Shell / No-Pre-Deploy) ---
    # This runs every time the app starts
    with app.app_context():
        try:
            print("--- Running on-start setup ---")

            # 1. Enable PostGIS
            db_url = app.config.get('SQLALCHEMY_DATABASE_URI') or os.environ.get('DATABASE_URL')
            if db_url:
                engine = create_engine(db_url)
                with engine.connect() as connection:
                    connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                    connection.commit()
                print("1/3: PostGIS extension checked/enabled.")
            else:
                print("1/3: DATABASE_URL not found, skipping PostGIS check.")

            # 2. Run Database Migrations
            # This is safe to run every time
            upgrade()
            print("2/3: Database migrations checked/applied.")

            # 3. Seed Database (only if empty)
            # We import the model here to avoid circular imports
            from app.models.trail import Trail
            if db.session.query(Trail).first() is None:
                print("3/3: No trails found. Running seed script...")
                # This runs the 'seed_mass_trails.py' script
                # Make sure it's in your root directory
                subprocess.run(["python", "seed_mass_trails.py"], check=True)
                print("3/3: Database seeding complete.")
            else:
                print("3/3: Database already seeded. Skipping seed script.")
                
            print("--- On-start setup complete ---")

        except Exception as e:
            # We print the error, so it shows up in Render logs
            print(f"--- ERROR DURING ON-START SETUP ---")
            print(f"Error: {e}")
            print("--- App will continue, but may not be functional ---")
            pass
    # --- End of New Setup Block ---

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(trail_bp)
    app.register_blueprint(fav_bp)
    app.register_blueprint(weather_bp)

    return app
