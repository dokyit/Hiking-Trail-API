# HikingTrail Application Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│                    (React Frontend - Port 3000)                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                │
┌─────────────────────────────────────────────────────────────────┐
│                      FLASK API SERVER                            │
│                      (Backend - Port 5000)                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
                    ▼                       ▼
        ┌────────────────────┐  ┌────────────────────┐
        │  PostgreSQL + GIS  │  │   Redis Cache      │
        │   (Port 5432)      │  │   (Port 6379)      │
        └────────────────────┘  └────────────────────┘
                    │
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│ Google Maps  │      │  WeatherStack    │
│     API      │      │       API        │
└──────────────┘      └──────────────────┘
```

---

## Detailed File/Module Architecture

### 📁 **Root Directory Structure**

```
HikingTrail/
│
├── 🐍 Backend (Flask Application)
│   ├── app/                          # Main application package
│   │   ├── __init__.py              # Flask app factory
│   │   ├── config.py                # Configuration settings
│   │   ├── extensions.py            # Flask extensions (DB, Cache, JWT, etc.)
│   │   │
│   │   ├── models/                  # Database models
│   │   │   ├── __init__.py
│   │   │   ├── trail.py            # Trail model (PostGIS geometry)
│   │   │   └── user.py             # User model (auth)
│   │   │
│   │   └── api/                     # API route blueprints
│   │       ├── __init__.py
│   │       ├── auth_routes.py      # Login, register, JWT auth
│   │       ├── trail_routes.py     # Trail search & details
│   │       ├── favorites_routes.py # User favorites (CRUD)
│   │       └── weather_routes.py   # Weather API integration
│   │
│   ├── migrations/                   # Database migrations (Alembic)
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_migration.py
│   │
│   ├── run.py                       # Application entry point
│   ├── seed_mass_trails.py          # Database seeding script
│   ├── requirements.txt             # Python dependencies
│   ├── Dockerfile                   # Backend Docker config
│   └── .env                         # Environment variables (secrets)
│
├── ⚛️ Frontend (React Application)
│   └── frontend/
│       ├── public/                   # Static assets
│       │   ├── index.html
│       │   ├── manifest.json
│       │   └── robots.txt
│       │
│       ├── src/                      # React source code
│       │   ├── index.js             # React entry point
│       │   ├── App.js               # Main app component
│       │   ├── App.css
│       │   │
│       │   ├── components/          # Reusable components
│       │   │   ├── MapComponent.js      # Google Maps integration + animation
│       │   │   ├── TrailCard.js         # Trail preview card
│       │   │   ├── TrailModal.js        # Detailed trail popup
│       │   │   ├── Weather.js           # Weather widget
│       │   │   ├── NavBar.js            # Navigation bar
│       │   │   └── ProtectedRoute.js    # Auth guard
│       │   │
│       │   ├── pages/               # Page components
│       │   │   ├── Dashboard.js         # Main search/map interface
│       │   │   ├── LoginPage.js         # User login
│       │   │   ├── RegisterPage.js      # User registration
│       │   │   └── FavoritesPage.js     # User's saved trails
│       │   │
│       │   └── context/             # React Context (state)
│       │       └── AuthContext.js       # Authentication state
│       │
│       ├── build/                    # Production build output
│       ├── package.json              # NPM dependencies
│       ├── Dockerfile.dev            # Frontend Docker config
│       └── README.md
│
├── 🐳 Docker Configuration
│   └── docker-compose.yml            # Multi-container orchestration
│
└── 📝 Documentation
    ├── QUICKSTART.md                 # Quick start guide
    ├── SETUP_TRAILS.md               # Trail seeding guide
    ├── AUTHENTICATION_REMOVED.md     # Auth removal notes
    └── PROXY_FIX.md                  # Proxy configuration notes
```

---

## Component Flow Diagram

### 🔄 **Trail Search Flow**

```
┌─────────────┐
│   User      │
│ enters city │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Dashboard.js       │ ◄── State: city, trails, mapCenter
│  (Search Form)      │
└──────┬──────────────┘
       │ axios.get('/api/trails/search?city=...')
       ▼
┌─────────────────────┐
│ trail_routes.py     │
│ /api/trails/search  │
└──────┬──────────────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌──────────────────┐          ┌──────────────────┐
│  Google Maps API │          │  PostgreSQL DB   │
│  (Geocoding)     │          │  (PostGIS Query) │
└──────┬───────────┘          └─────────┬────────┘
       │                                 │
       │ Returns lat/lng                 │ Returns trails within radius
       │                                 │
       └─────────────┬───────────────────┘
                     │
                     ▼
              ┌─────────────┐
              │ JSON Response│
              │ - trails[]   │
              │ - map_center │
              └──────┬───────┘
                     │
       ┌─────────────┴─────────────┐
       │                           │
       ▼                           ▼
┌──────────────┐          ┌──────────────────┐
│  TrailCard   │          │  MapComponent    │
│  (List View) │          │  (Map Animation) │
└──────────────┘          └──────────────────┘
       │
       │ User clicks card
       ▼
┌──────────────┐
│ TrailModal   │ ◄── axios.get('/api/trails/:id')
│ (Details)    │
└──────────────┘
```

---

## Data Models

### 🗺️ **Trail Model** (app/models/trail.py)

```python
Trail {
    id: Integer (PK)
    name: String(255)
    location: String(255)
    length_miles: Float
    elevation_gain_ft: Float
    description: Text
    difficulty: Integer (1-4)
    geom: Geometry(LINESTRING, SRID=4326)  # PostGIS
}
```

**Difficulty Levels:**
- 1 = Easy (🟢 Green)
- 2 = Moderate (🟡 Yellow)
- 3 = Hard (🟠 Orange)
- 4 = Extremely Hard (🔴 Red)

### 👤 **User Model** (app/models/user.py)

```python
User {
    id: Integer (PK)
    username: String(80) UNIQUE
    email: String(120) UNIQUE
    password_hash: String(128)
    favorites: Relationship → Trail (Many-to-Many)
}
```

---

## API Endpoints

### 🏔️ **Trail Routes** (`/api/trails`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/search?city={city}` | Search trails near city | `{trails: [], map_center: {lat, lng}}` |
| GET | `/{trail_id}` | Get trail details | `{trail: {...}, necessity_list: []}` |

### 🌤️ **Weather Routes** (`/api`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/weather?city={city}` | Get current weather | `{temperature, description, icon_url}` |

### 🔐 **Auth Routes** (`/api/auth`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| POST | `/register` | Create new user | `{message, token}` |
| POST | `/login` | Authenticate user | `{token, user: {...}}` |

### ⭐ **Favorites Routes** (`/api/favorites`)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/` | Get user's favorites | `{favorites: [...]}` |
| POST | `/` | Add favorite | `{message}` |
| DELETE | `/{trail_id}` | Remove favorite | `{message}` |

---

## Technology Stack

### Backend
- **Framework**: Flask 2.3.3
- **Database ORM**: SQLAlchemy 3.0.5
- **Spatial Extension**: GeoAlchemy2 0.14.4 + PostGIS
- **Authentication**: Flask-JWT-Extended 4.5.3
- **Caching**: Flask-Caching 2.1.0 + Redis
- **Migrations**: Flask-Migrate 4.0.5 (Alembic)
- **Password Hashing**: Flask-Bcrypt 1.0.1

### Frontend
- **Framework**: React 18.x
- **Maps**: @vis.gl/react-google-maps
- **HTTP Client**: Axios
- **Routing**: React Router
- **Styling**: Inline CSS (Component-level)

### Database
- **Primary DB**: PostgreSQL 15+
- **Extension**: PostGIS (spatial/geographic objects)
- **Cache**: Redis 5.0.1

### External APIs
- **Google Maps API**: Geocoding, Map display
- **WeatherStack API**: Current weather data

---

## Key Features Implementation

### 🎯 **City Search with Map Animation**

**Location**: `frontend/src/pages/Dashboard.js` + `frontend/src/components/MapComponent.js`

1. User enters city name
2. Dashboard submits to `/api/trails/search?city={city}`
3. Backend geocodes city using Google Maps API
4. PostGIS query finds trails within 25-mile radius
5. Frontend updates `mapCenter` state
6. MapComponent's `MapAnimator` detects center change
7. Calls `map.panTo(center)` for smooth animation
8. Trails render as color-coded markers

### 🎴 **Trail Cards with Difficulty**

**Location**: `frontend/src/components/TrailCard.js`

- Visual difficulty badges with color coding
- Hover effects (elevation + border color change)
- Shows: name, location, difficulty, length, elevation
- Clickable to open detailed modal

### 📋 **Trail Details Modal**

**Location**: `frontend/src/components/TrailModal.js`

- Fetches full trail data on open
- Grid layout for stats
- Difficulty-specific gear necessity list
- Smooth fade-in/slide-up animation
- Close on backdrop click or X button

### 🌡️ **Weather Integration**

**Location**: `frontend/src/components/Weather.js`

- Fetches weather when city changes
- Displays temperature, conditions, icon
- Cached for 30 minutes (backend)
- Error handling for API failures

---

## Deployment Architecture

### Docker Compose Setup

```yaml
services:
  backend:
    - Flask application
    - Port 5000
    - Depends on: postgres, redis
    
  frontend:
    - React dev server (dev) or Nginx (prod)
    - Port 3000 (dev) or 80 (prod)
    
  postgres:
    - PostgreSQL 15 with PostGIS
    - Port 5432
    - Persistent volume
    
  redis:
    - Redis cache
    - Port 6379
```

---

## Security Considerations

- ✅ JWT tokens for authentication
- ✅ Bcrypt password hashing
- ✅ Environment variables for secrets
- ✅ CORS configured
- ✅ ProxyFix for reverse proxy headers
- ⚠️ Input validation needed on search queries
- ⚠️ Rate limiting recommended for API endpoints

---

## Performance Optimizations

### Backend
- ✅ Redis caching for geocoding (30 days)
- ✅ Redis caching for weather (30 minutes)
- ✅ Redis caching for trail searches (1 hour)
- ✅ PostGIS spatial indexing on `geom` column
- ✅ Connection pooling (SQLAlchemy)

### Frontend
- ✅ Component-level state management
- ✅ Lazy loading for trail modals
- ⚠️ Consider React.memo for TrailCard
- ⚠️ Implement virtual scrolling for long trail lists

---

## Future Enhancements

1. **Trail Photos**: Add image uploads/galleries
2. **User Reviews**: Rating and comment system
3. **Route Planning**: Multi-trail itineraries
4. **Elevation Profiles**: Chart.js elevation graphs
5. **Trail Conditions**: User-reported conditions/alerts
6. **Offline Mode**: PWA with service workers
7. **Social Features**: Share trails, friend system
8. **Advanced Filters**: Difficulty, length, elevation ranges
9. **Mobile App**: React Native version
10. **Trail Recording**: GPX upload and path visualization

---

## Monitoring & Logging

**Recommended Tools:**
- Application: Flask logging + Sentry
- Database: pgAdmin or DataGrip
- Cache: Redis CLI or RedisInsight
- API Monitoring: Postman or Insomnia
- Performance: New Relic or Datadog

---

**Generated**: November 5, 2025  
**Version**: 1.0  
**Maintained by**: HikingTrail Development Team
