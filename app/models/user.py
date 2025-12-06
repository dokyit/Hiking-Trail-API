from datetime import datetime

from app.extensions import bcrypt, db

# Many-to-many join table for user favorites
favorites = db.Table(
    "favorites",
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
    db.Column("trail_id", db.Integer, db.ForeignKey("trails.id"), primary_key=True),
)


class User(db.Model):
    """User model for authentication and favorites."""

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    # Login tracking fields
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime)
    last_ip = db.Column(db.String(45))  # IPv6 can be up to 45 characters
    last_user_agent = db.Column(db.String(255))

    # Define the many-to-many relationship
    favorited_trails = db.relationship(
        "Trail",
        secondary=favorites,
        backref=db.backref("favorited_by", lazy="dynamic"),
        lazy="dynamic",
    )

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

    def update_login_info(self, ip_address=None, user_agent=None):
        """Update user's last login timestamp and related info."""
        self.last_login = datetime.utcnow()
        if ip_address:
            self.last_ip = ip_address
        if user_agent:
            self.last_user_agent = user_agent
        db.session.commit()

    def serialize(self):
        """Serialize user data (exclude sensitive info)."""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
