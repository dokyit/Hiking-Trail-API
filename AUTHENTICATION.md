# 🔐 Authentication & Middleware Documentation

Complete guide to the authentication system and middleware in the Hiking Trail API.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Model](#user-model)
3. [Authentication Flow](#authentication-flow)
4. [Middleware Decorators](#middleware-decorators)
5. [API Endpoints](#api-endpoints)
6. [Usage Examples](#usage-examples)
7. [Security Features](#security-features)
8. [Testing](#testing)

---

## 🎯 Overview

The Hiking Trail API uses **JWT (JSON Web Token)** authentication with comprehensive middleware for:

- ✅ User registration and login
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Login activity tracking (timestamp, IP, user agent)
- ✅ Protected route decorators
- ✅ Input validation middleware
- ✅ Optional authentication support
- ✅ Rate limiting (basic implementation)

---

## 👤 User Model

### Database Schema

The `User` model stores user information in the `users` table:

```python
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    
    # Login tracking
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime)
    last_ip = db.Column(db.String(45))  # IPv6 support
    last_user_agent = db.Column(db.String(255))
    
    # Relationships
    favorited_trails = db.relationship('Trail', secondary='favorites')
```

### User Methods

**Set Password:**
```python
user.set_password('my_secure_password')
# Hashes password with bcrypt and stores in password_hash
```

**Check Password:**
```python
user.check_password('password_attempt')
# Returns True if password matches, False otherwise
```

**Update Login Info:**
```python
user.update_login_info(ip_address='192.168.1.1', user_agent='Mozilla/5.0...')
# Updates last_login, last_ip, last_user_agent
```

**Serialize:**
```python
user.serialize()
# Returns: {
#     "id": 1,
#     "username": "john_doe",
#     "email": "john@example.com",
#     "created_at": "2024-01-15T10:30:00",
#     "last_login": "2024-01-16T14:20:00"
# }
```

---

## 🔄 Authentication Flow

### Registration Flow

```
1. User submits: username, email, password
   POST /api/auth/register
   
2. Backend validates input:
   ✓ Username >= 3 characters
   ✓ Valid email format
   ✓ Password >= 6 characters
   ✓ Username/email not already taken
   
3. Create user:
   - Hash password with bcrypt
   - Store user in database
   - Track registration IP and user agent
   
4. Return success message + user info
```

### Login Flow

```
1. User submits: username, password
   POST /api/auth/login
   
2. Backend verifies credentials:
   ✓ Find user by username
   ✓ Check password hash
   
3. If valid:
   - Update last_login timestamp
   - Track login IP and user agent
   - Generate JWT access token
   - Return token + user info
   
4. Client stores JWT token:
   - localStorage or sessionStorage
   - Include in Authorization header for protected routes
```

### Protected Route Access

```
1. Client makes request with JWT:
   GET /api/favorites
   Headers: { Authorization: "Bearer <jwt_token>" }
   
2. Middleware verifies token:
   ✓ Token present and valid
   ✓ User exists in database
   ✓ Token not expired
   
3. If valid:
   - Attach user to request
   - Execute route handler
   
4. If invalid:
   - Return 401 Unauthorized
```

---

## 🛡️ Middleware Decorators

### 1. `@login_required`

**Purpose:** Protect routes that require authentication.

**Usage:**
```python
from app.middleware import login_required

@app.route('/protected')
@login_required
def protected_route(current_user=None):
    return jsonify(message=f"Hello {current_user.username}!")
```

**Behavior:**
- ✅ Verifies JWT token in Authorization header
- ✅ Validates user exists in database
- ✅ Injects `current_user` into route function
- ❌ Returns 401 if token missing/invalid

---

### 2. `@optional_login`

**Purpose:** Routes where authentication is optional but user info is available if logged in.

**Usage:**
```python
from app.middleware import optional_login

@app.route('/optional')
@optional_login
def optional_route(current_user=None):
    if current_user:
        return jsonify(message=f"Hello {current_user.username}")
    return jsonify(message="Hello guest")
```

**Behavior:**
- ✅ Checks for JWT token
- ✅ Injects `current_user` (or None) into route
- ✅ Route executes regardless of authentication status

---

### 3. `@validate_user_input`

**Purpose:** Validate required fields are present in JSON request body.

**Usage:**
```python
from app.middleware import validate_user_input

@app.route('/create', methods=['POST'])
@validate_user_input(['username', 'email', 'password'])
def create_user():
    data = request.get_json()
    # Guaranteed to have username, email, password
    return jsonify(message="User created")
```

**Behavior:**
- ✅ Checks request has JSON body
- ✅ Validates all required fields present
- ❌ Returns 400 with missing fields list if validation fails

---

### 4. `@admin_required` (Optional)

**Purpose:** Protect routes requiring admin privileges.

**Usage:**
```python
from app.middleware import admin_required

@app.route('/admin')
@admin_required
def admin_route(current_user=None):
    return jsonify(message="Admin access granted")
```

**Note:** Requires adding `is_admin` boolean field to User model.

---

### 5. `@rate_limit_by_user`

**Purpose:** Simple per-user rate limiting.

**Usage:**
```python
from app.middleware import login_required, rate_limit_by_user

@app.route('/api/data')
@login_required
@rate_limit_by_user(max_requests=50, window_seconds=3600)
def get_data(current_user=None):
    return jsonify(data="...")
```

**Behavior:**
- ✅ Tracks requests per user in memory
- ✅ Enforces max requests per time window
- ❌ Returns 429 if limit exceeded
- ⚠️ **Note:** Uses in-memory storage. Use Redis in production.

---

## 🌐 API Endpoints

### Authentication Endpoints

#### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00",
    "last_login": null
  }
}
```

**Error Responses:**
- `400` - Invalid input (username too short, invalid email, etc.)
- `409` - Username or email already exists

---

#### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00",
    "last_login": "2024-01-16T14:20:00"
  }
}
```

**Error Response:**
- `401` - Invalid credentials

**Client Storage:**
```javascript
// Store token in localStorage
localStorage.setItem('access_token', response.data.access_token);
```

---

#### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00",
    "last_login": "2024-01-16T14:20:00"
  }
}
```

**Error Response:**
- `401` - Authentication required

---

#### 4. Logout User

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "Logout successful. Please remove token from client.",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Client Cleanup:**
```javascript
// Remove token from localStorage
localStorage.removeItem('access_token');
```

---

### Favorites Endpoints (Protected)

#### 1. Get Favorites

**Endpoint:** `GET /api/favorites`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "favorites": [
    {
      "id": 1,
      "name": "Blue Hills Skyline Trail",
      "location": "Milton, MA",
      "length_miles": 5.2,
      "elevation_gain_ft": 850,
      "difficulty": 2
    }
  ],
  "count": 1
}
```

---

#### 2. Add Favorite

**Endpoint:** `POST /api/favorites`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "trail_id": 1
}
```

**Response (201 Created):**
```json
{
  "message": "Favorite added",
  "trail": {
    "id": 1,
    "name": "Blue Hills Skyline Trail",
    "location": "Milton, MA"
  }
}
```

**Error Responses:**
- `404` - Trail not found
- `409` - Trail already in favorites

---

#### 3. Remove Favorite

**Endpoint:** `DELETE /api/favorites/<trail_id>`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "message": "Favorite removed"
}
```

**Error Response:**
- `404` - Trail not found or not in favorites

---

## 💻 Usage Examples

### Frontend - React/JavaScript

#### 1. Register User

```javascript
import axios from 'axios';
import API_URL from '../config';

const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password
    });
    
    console.log('User created:', response.data.user);
    return response.data;
  } catch (error) {
    console.error('Registration failed:', error.response.data.message);
    throw error;
  }
};
```

---

#### 2. Login User

```javascript
const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    
    // Store token
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    console.error('Login failed:', error.response.data.message);
    throw error;
  }
};
```

---

#### 3. Make Authenticated Requests

```javascript
// Configure axios to include token in all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Now all requests include the token
const getFavorites = async () => {
  const response = await axios.get(`${API_URL}/api/favorites`);
  return response.data.favorites;
};
```

---

#### 4. Handle Token Expiration

```javascript
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

### Backend - Python/Flask

#### 1. Create Protected Route

```python
from flask import Blueprint, jsonify
from app.middleware import login_required

api_bp = Blueprint('api_bp', __name__, url_prefix='/api')

@api_bp.route('/profile')
@login_required
def get_profile(current_user=None):
    """Get user profile - requires authentication."""
    return jsonify(
        user=current_user.serialize(),
        favorite_count=current_user.favorited_trails.count()
    ), 200
```

---

#### 2. Optional Authentication

```python
from app.middleware import optional_login

@api_bp.route('/trails')
@optional_login
def get_trails(current_user=None):
    """Get trails - optionally show favorites if logged in."""
    trails = Trail.query.all()
    
    result = []
    for trail in trails:
        trail_data = trail.serialize()
        
        # Add favorite status if user is logged in
        if current_user:
            trail_data['is_favorite'] = trail in current_user.favorited_trails
        
        result.append(trail_data)
    
    return jsonify(trails=result), 200
```

---

#### 3. Input Validation

```python
from app.middleware import validate_user_input, login_required

@api_bp.route('/trails/review', methods=['POST'])
@login_required
@validate_user_input(['trail_id', 'rating', 'comment'])
def add_review(current_user=None):
    """Add trail review - requires auth and validates input."""
    data = request.get_json()
    
    # Input is already validated by middleware
    review = Review(
        user_id=current_user.id,
        trail_id=data['trail_id'],
        rating=data['rating'],
        comment=data['comment']
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify(message="Review added"), 201
```

---

## 🔒 Security Features

### 1. Password Security

- ✅ **Bcrypt Hashing:** Passwords hashed with bcrypt (industry standard)
- ✅ **No Plain Text:** Passwords never stored in plain text
- ✅ **Salt Rounds:** Bcrypt automatically handles salting
- ✅ **Minimum Length:** 6 character minimum (configurable)

---

### 2. JWT Tokens

- ✅ **Stateless:** No server-side session storage
- ✅ **Signed:** Tokens cryptographically signed
- ✅ **Expiration:** Tokens expire after configured time
- ✅ **Secret Key:** Uses SECRET_KEY from environment

**Configure Token Expiration:**
```python
# In app/config.py
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)  # 24 hour expiration
```

---

### 3. Login Tracking

The system tracks:
- ✅ **Last Login Time:** When user last authenticated
- ✅ **IP Address:** User's IP (handles proxies/load balancers)
- ✅ **User Agent:** Browser/client information
- ✅ **Account Creation:** When account was created

**Security Uses:**
- Detect suspicious login patterns
- Geographic anomalies
- Multiple device usage
- Audit trail for compliance

---

### 4. Input Validation

- ✅ **Required Fields:** Validates all required fields present
- ✅ **Email Format:** Basic email validation
- ✅ **Username Length:** Minimum 3 characters
- ✅ **Password Strength:** Minimum 6 characters (increase in production!)

**Best Practices:**
```python
# Add stricter validation in production:
if len(password) < 12:
    return jsonify(message="Password must be at least 12 characters"), 400

if not re.search(r"[A-Z]", password):
    return jsonify(message="Password must contain uppercase letter"), 400

if not re.search(r"[0-9]", password):
    return jsonify(message="Password must contain number"), 400
```

---

### 5. CORS Protection

CORS is configured to allow frontend access:

```python
# In app/__init__.py
CORS(app, resources={
    r"/api/*": {
        "origins": "*",  # Change to specific domain in production!
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

**Production Configuration:**
```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://hiking-trail-frontend.onrender.com"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Length"],
        "supports_credentials": True
    }
})
```

---

## 🧪 Testing

### Manual Testing with cURL

#### 1. Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

#### 2. Login User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

**Save the access_token from response!**

---

#### 3. Access Protected Route

```bash
TOKEN="<your_access_token_here>"

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

#### 4. Add Favorite

```bash
curl -X POST http://localhost:5000/api/favorites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "trail_id": 1
  }'
```

---

### Automated Testing (Pytest)

```python
# tests/test_auth.py
import pytest
from app import create_app, db
from app.models.user import User

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_register_user(client):
    """Test user registration."""
    response = client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    assert response.status_code == 201
    assert 'User created successfully' in response.json['message']

def test_login_user(client):
    """Test user login."""
    # First register
    client.post('/api/auth/register', json={
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123'
    })
    
    # Then login
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'password123'
    })
    
    assert response.status_code == 200
    assert 'access_token' in response.json

def test_protected_route_requires_auth(client):
    """Test that protected routes require authentication."""
    response = client.get('/api/auth/me')
    
    assert response.status_code == 401
```

---

## 🚀 Production Recommendations

### 1. Environment Variables

```env
# Strong secret keys (generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-also-change-this

# Token expiration
JWT_ACCESS_TOKEN_EXPIRES=86400  # 24 hours in seconds
```

---

### 2. Password Requirements

Enforce stronger passwords in production:

```python
import re

def validate_password(password):
    """Validate password meets security requirements."""
    if len(password) < 12:
        return False, "Password must be at least 12 characters"
    
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain uppercase letter"
    
    if not re.search(r"[a-z]", password):
        return False, "Password must contain lowercase letter"
    
    if not re.search(r"[0-9]", password):
        return False, "Password must contain number"
    
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain special character"
    
    return True, "Password valid"
```

---

### 3. Rate Limiting

Use Redis for production rate limiting:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="redis://localhost:6379"
)

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")  # Prevent brute force
def login_user():
    # ... login logic
```

---

### 4. Token Blacklist

Implement token revocation with Redis:

```python
import redis
from datetime import timedelta

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def blacklist_token(jti, expires_in):
    """Add token to blacklist."""
    redis_client.setex(f"blacklist:{jti}", expires_in, "true")

def is_token_blacklisted(jti):
    """Check if token is blacklisted."""
    return redis_client.exists(f"blacklist:{jti}")
```

---

### 5. HTTPS Only

Ensure all authentication happens over HTTPS:

```python
from flask import request, abort

@app.before_request
def before_request():
    if not request.is_secure and not app.debug:
        abort(403)  # Reject non-HTTPS requests in production
```

---

## 📚 Additional Resources

- **Flask-JWT-Extended Docs:** https://flask-jwt-extended.readthedocs.io/
- **Bcrypt Docs:** https://github.com/pyca/bcrypt/
- **OWASP Authentication Guide:** https://owasp.org/www-project-web-security-testing-guide/
- **JWT.io:** https://jwt.io/ (Token debugger)

---

## 🤝 Support

For issues or questions:
- Check the API documentation
- Review middleware code in `app/middleware/`
- Contact the development team

---

**Authentication system ready! Secure your trails! 🔐🥾**