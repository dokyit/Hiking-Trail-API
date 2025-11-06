from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_caching import Cache
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
migrate = Migrate()
cache = Cache()
jwt = JWTManager()
bcrypt = Bcrypt()
