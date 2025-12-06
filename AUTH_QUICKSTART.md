# 🚀 Authentication Quick Start Guide

Quick reference for using the authentication middleware in the Hiking Trail API.

---

## 📦 What You Have

✅ **Complete authentication system with:**
- User registration & login
- JWT token authentication
- Password hashing (bcrypt)
- Login tracking (timestamp, IP, user agent)
- Protected route decorators
- Input validation middleware
- Stored in PostgreSQL database

---

## 🔑 Key Files

| File | Purpose |
|------|---------|
| `app/models/user.py` | User model with login tracking |
| `app/middleware/auth_middleware.py` | All middleware decorators |
| `app/api/auth_routes.py` | Registration, login, /me endpoints |
| `app/api/favorites_routes.py` | Example of protected routes |
| `migrations/versions/add_user_login_tracking.py` | Database migration |

---

## 🎯 Quick Examples

### 1. Register a User

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure123"
  }'
```

**Response:**
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

---

### 2. Login

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "last_login": "2024-01-15T10:35:00"
  }
}
```

**💡 Save the token!**

---

### 3. Access Protected Route

**Request:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00",
    "last_login": "2024-01-15T10:35:00"
  }
}
```

---

## 🛡️ Using Middleware in Your Routes

### Protect a Route (Login Required)

```python
from flask import Blueprint, jsonify
from app.middleware import login_required

api_bp = Blueprint('api_bp', __name__)

@api_bp.route('/protected')
@login_required
def protected_route(current_user=None):
    """Only authenticated users can access this."""
    return jsonify(
        message=f"Hello {current_user.username}!",
        user=current_user.serialize()
    ), 200
```

---

### Optional Authentication

```python
from app.middleware import optional_login

@api_bp.route('/public')
@optional_login
def public_route(current_user=None):
    """Anyone can access, but show different content if logged in."""
    if current_user:
        return jsonify(message=f"Welcome back, {current_user.username}!")
    return jsonify(message="Hello, guest!")
```

---

### Validate Input

```python
from app.middleware import validate_user_input

@api_bp.route('/create', methods=['POST'])
@validate_user_input(['name', 'email', 'message'])
def create_item():
    """Ensures name, email, message are in request body."""
    data = request.get_json()
    # All required fields are guaranteed to exist
    return jsonify(message="Item created"), 201
```

---

### Combine Multiple Decorators

```python
from app.middleware import login_required, validate_user_input

@api_bp.route('/reviews', methods=['POST'])
@login_required
@validate_user_input(['trail_id', 'rating', 'comment'])
def add_review(current_user=None):
    """Protected route with input validation."""
    data = request.get_json()
    
    # User is authenticated (current_user available)
    # Input is validated (all fields present)
    
    return jsonify(message="Review added"), 201
```

---

## 🎨 Frontend Integration (React/JavaScript)

### 1. Setup Axios Interceptor

```javascript
// src/api/axios.js
import axios from 'axios';
import API_URL from '../config';

// Add token to all requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 (token expired)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
```

---

### 2. Register Component

```javascript
import axios from './api/axios';
import API_URL from './config';

const handleRegister = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password
    });
    
    alert('Registration successful! Please login.');
    navigate('/login');
  } catch (error) {
    alert(error.response?.data?.message || 'Registration failed');
  }
};
```

---

### 3. Login Component

```javascript
const handleLogin = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password
    });
    
    // Store token
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    navigate('/dashboard');
  } catch (error) {
    alert(error.response?.data?.message || 'Login failed');
  }
};
```

---

### 4. Protected Component

```javascript
import { useEffect, useState } from 'react';
import axios from './api/axios';
import API_URL from './config';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/auth/me`);
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    
    fetchProfile();
  }, []);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {user.username}!</h1>
      <p>Email: {user.email}</p>
      <p>Member since: {new Date(user.created_at).toLocaleDateString()}</p>
    </div>
  );
};
```

---

### 5. Logout Function

```javascript
const handleLogout = () => {
  // Remove token
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  
  // Redirect to login
  navigate('/login');
};
```

---

## 📊 Database Schema

The User model stores:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128),
    
    -- Login tracking (NEW!)
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP,
    last_ip VARCHAR(45),
    last_user_agent VARCHAR(255)
);
```

---

## 🔒 What Gets Tracked

When a user logs in, the system automatically stores:

✅ **Last Login Time** - `2024-01-15T10:35:00`
✅ **IP Address** - `192.168.1.100` (handles proxies)
✅ **User Agent** - `Mozilla/5.0 (Windows NT 10.0; Win64; x64)...`
✅ **Account Creation** - `2024-01-15T10:30:00`

**Uses:**
- Security monitoring
- Suspicious activity detection
- Audit trails
- Analytics

---

## 🚀 Deploy to Render

The authentication system is ready for deployment!

### 1. Run Migration

When you deploy to Render, the migration runs automatically via `build.sh`:

```bash
flask db upgrade
```

This adds the new columns to the users table.

### 2. Test Endpoints

After deployment:

```bash
# Register
curl -X POST https://hiking-trail-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123"}'

# Login
curl -X POST https://hiking-trail-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

---

## 🎯 Available Decorators

| Decorator | Purpose | Returns 401 if Not Logged In? |
|-----------|---------|-------------------------------|
| `@login_required` | Protect route, require auth | ✅ Yes |
| `@optional_login` | Optional auth, user available if logged in | ❌ No |
| `@validate_user_input(['field1', 'field2'])` | Validate JSON fields | ❌ No (returns 400) |
| `@admin_required` | Require admin privileges | ✅ Yes |
| `@rate_limit_by_user(max=50, window=3600)` | Limit requests per user | ❌ No (returns 429) |

---

## 🎨 Helper Functions

```python
from app.middleware import (
    get_current_user,   # Get user from JWT (or None)
    get_client_ip,      # Get user's IP address
    get_user_agent,     # Get user's browser/client
    track_login_activity # Update user login info
)

# Example usage
@app.route('/admin/users')
@admin_required
def list_users(current_user=None):
    ip = get_client_ip()
    user_agent = get_user_agent()
    
    print(f"Admin {current_user.username} accessed from {ip}")
    
    users = User.query.all()
    return jsonify(users=[u.serialize() for u in users])
```

---

## ✅ Checklist

**Before deploying:**

- [ ] Add `.env` with `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Ensure migration file exists: `migrations/versions/add_user_login_tracking.py`
- [ ] Test registration endpoint locally
- [ ] Test login endpoint locally
- [ ] Test protected routes with token
- [ ] Update frontend to store/send JWT token

**After deploying:**

- [ ] Run migration: `flask db upgrade` (automatic in `build.sh`)
- [ ] Test registration on live URL
- [ ] Test login on live URL
- [ ] Test protected routes
- [ ] Verify login tracking in database

---

## 📚 More Documentation

- **Full Guide:** `AUTHENTICATION.md` - Complete authentication documentation
- **API Endpoints:** See all auth routes and examples
- **Security:** Best practices and production recommendations
- **Middleware:** Detailed decorator documentation

---

## 🆘 Troubleshooting

### "Invalid or missing authentication token"

**Cause:** JWT token not included or expired

**Fix:**
```javascript
// Check token exists
const token = localStorage.getItem('access_token');
console.log('Token:', token);

// Include in request
axios.get(url, {
  headers: { Authorization: `Bearer ${token}` }
});
```

---

### "Authentication required"

**Cause:** Accessing protected route without token

**Fix:** Login first and get token, then include in requests

---

### "User not found"

**Cause:** Token is valid but user deleted from database

**Fix:** Logout and login again

---

### Migration fails

**Cause:** Database columns already exist

**Fix:** 
```bash
# Drop and recreate (DEVELOPMENT ONLY!)
flask db downgrade
flask db upgrade
```

---

## 🎉 You're Ready!

Your authentication system is complete and ready to use:

✅ User registration stored in database
✅ Login with JWT tokens
✅ Password hashing with bcrypt
✅ Login activity tracking (timestamp, IP, user agent)
✅ Protected route decorators
✅ Input validation middleware
✅ Frontend integration ready

**Start building protected features! 🔐🚀**