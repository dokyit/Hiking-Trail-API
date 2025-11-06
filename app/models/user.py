from app.extensions import db, bcrypt

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
