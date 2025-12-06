# 🥾 HikingTrail Application - Status & Setup Guide

**Last Updated:** December 4, 2024  
**Status:** ✅ OPERATIONAL

---

## 🎯 Current Application Status

### Services Running:
- ✅ **Backend API** - Running on `http://localhost:5000`
- ✅ **Frontend React App** - Running on `http://localhost:3000`
- ✅ **PostgreSQL Database** - Running on `localhost:5432`
- ✅ **CORS** - Properly configured for localhost:3000

### Configuration:
- ✅ `config.js` created for API URL management
- ✅ Backend port: **5000**
- ✅ Frontend port: **3000**
- ✅ Database: PostgreSQL with PostGIS extension
- ✅ Authentication: JWT-based with token management
- ✅ Caching: Redis (external cloud service)

---

## 🚀 How to Start the Application

### Option 1: One-Click Startup (Recommended)
```powershell
.\start.ps1
```
or
```batch
.\start.bat
```

### Option 2: Manual Docker Compose
```powershell
# Start all services
docker-compose up -d

# Wait 10 seconds for database to initialize

# Run migrations
docker-compose exec backend flask db upgrade

# Seed trail data
docker-compose exec backend python seed_mass_trails.py
```

### Option 3: Check if Already Running
```powershell
docker-compose ps
```

---

## 🌐 Access Points

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432 (internal only)

---

## 🔧 Required Configuration

### Environment Variables
You need a `.env` file in the root directory with:

```env
# Required
GOOGLE_MAPS_KEY=your_google_maps_api_key_here

# Optional
WEATHERSTACK_KEY=your_weatherstack_api_key_here
```

**⚠️ IMPORTANT:** If you see "InvalidKeyMapError", check that your Google Maps API key:
1. Starts with `AIza` (not `Alza` - common typo!)
2. Has the correct APIs enabled:
   - Maps JavaScript API ✅
   - Geocoding API ✅

---

## ✨ Application Features

### Core Features:
1. **Trail Search** - Search for hiking trails near any city
2. **Interactive Map** - Google Maps with trail markers
3. **Trail Details** - View comprehensive trail information
4. **Trail Highlighting** - Click trail cards to see path on map
5. **Filtering** - Filter by difficulty (Easy, Moderate, Hard)
6. **Sorting** - Sort by name, distance, elevation
7. **User Authentication** - Register and login
8. **Favorites System** - Save favorite trails (requires login)
9. **Weather Integration** - View weather for searched cities (optional)

### Authentication Features:
- JWT token-based authentication
- Login tracking (timestamp, IP, user agent)
- Protected routes with middleware
- Persistent favorites across sessions

---

## 📊 Database Schema

### Tables:
1. **users** - User accounts with authentication
   - `id`, `username`, `email`, `password_hash`
   - `created_at`, `last_login`, `last_ip`, `last_user_agent`

2. **trails** - Hiking trail data with geospatial coordinates
   - `id`, `name`, `location`, `difficulty`, `distance`, `elevation_gain`
   - `geometry` (PostGIS LineString for trail paths)
   - `description`, `latitude`, `longitude`

3. **favorites** - User-trail associations
   - `id`, `user_id`, `trail_id`, `created_at`

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module '../config'"
**Cause:** `config.js` file is missing  
**Solution:** File has been recreated at `frontend/src/config.js`

### Issue 2: Google Maps "InvalidKeyMapError"
**Cause:** API key typo or invalid key  
**Solution:**
1. Check your `.env` file
2. Verify key starts with `AIza` (not `Alza`)
3. Enable required APIs in Google Cloud Console
4. Restart: `docker-compose restart backend frontend`

### Issue 3: CORS Errors
**Cause:** Backend not running or frontend calling wrong port  
**Solution:**
- Verify backend is on port 5000: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Ensure `config.js` has `http://localhost:5000`

### Issue 4: "401 Unauthorized" on Favorites
**Cause:** Not logged in (expected behavior)  
**Solution:** This is normal! Register/login to use favorites feature.

### Issue 5: "Weather data unavailable"
**Cause:** WeatherStack API key not configured  
**Solution:** Optional feature - add `WEATHERSTACK_KEY` to `.env` or ignore

---

## 🔍 Verification Steps

After starting the application, verify everything works:

### 1. Check Containers
```powershell
docker-compose ps
```
All three containers should show "Up" status.

### 2. Check Backend
```powershell
docker-compose logs backend --tail 20
```
Should see "Starting gunicorn" and "Booting worker" messages.

### 3. Test Frontend
Open http://localhost:3000 in your browser.

### 4. Test Search
- Type "Boston" in the search box
- Click "Search"
- Trail cards should appear
- Markers should show on map

### 5. Test Trail Interaction
- Click on any trail card
- Modal should open with trail details
- Trail path should highlight on map

### 6. Test Filters
- Click difficulty badges (Easy, Moderate, Hard)
- Trail list should filter accordingly

### 7. Test Authentication (Optional)
- Click "Register" and create an account
- Login with credentials
- Try adding a trail to favorites (star icon)

---

## 📁 Key Files

### Backend:
- `app/__init__.py` - Flask app factory with CORS config
- `app/api/trail_routes.py` - Trail search and retrieval endpoints
- `app/api/auth_routes.py` - User registration and login
- `app/api/favorites_routes.py` - Favorites management
- `app/models/` - SQLAlchemy models (User, Trail, Favorite)
- `seed_mass_trails.py` - Seeds 20 Massachusetts trails

### Frontend:
- `frontend/src/config.js` - API URL configuration ⭐
- `frontend/src/pages/Dashboard.js` - Main search and display page
- `frontend/src/components/MapComponent.js` - Google Maps integration
- `frontend/src/components/TrailCard.js` - Individual trail display
- `frontend/src/components/TrailModal.js` - Trail details popup
- `frontend/src/services/favoritesService.js` - Favorites API calls

### Configuration:
- `docker-compose.yml` - Multi-container orchestration
- `.env` - Environment variables (API keys)
- `requirements.txt` - Python dependencies
- `frontend/package.json` - Node.js dependencies

---

## 🔄 Restart Commands

### Restart Everything:
```powershell
docker-compose restart
```

### Restart Specific Service:
```powershell
docker-compose restart backend
docker-compose restart frontend
docker-compose restart db
```

### Full Rebuild (if code changes):
```powershell
docker-compose down
docker-compose up -d --build
```

### Stop Everything:
```powershell
docker-compose down
```

### Stop and Remove All Data:
```powershell
docker-compose down -v
```
⚠️ **Warning:** This deletes database data!

---

## 🧪 Testing Endpoints

### Test Backend Health (CLI):
```powershell
curl http://localhost:5000/api/trails/search?city=Boston
```

### Test Frontend (Browser):
Open http://localhost:3000 and search for "Boston"

### Test Authentication (CLI):
```powershell
# Register
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"test\",\"email\":\"test@example.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"test\",\"password\":\"password123\"}"
```

---

## 📈 Data

### Sample Trails Included:
The application comes pre-seeded with 20 Massachusetts hiking trails:
- Mount Greylock State Reservation
- Blue Hills Reservation
- Mohawk Trail State Forest
- Mount Watatic
- Wachusett Mountain State Reservation
- And 15 more...

Each trail includes:
- Name, location, difficulty rating (1-4)
- Distance (miles), elevation gain (feet)
- Full description
- GeoJSON LineString geometry (trail path coordinates)
- Recommended gear/necessities

---

## 🔐 Security Notes

### Production Checklist (when deploying to cloud):
- [ ] Move API keys to environment variables (done locally)
- [ ] Change JWT secret keys to strong random values
- [ ] Update CORS origins to your production domain
- [ ] Enable HTTPS/SSL
- [ ] Add rate limiting to prevent abuse
- [ ] Set up token blacklisting for logout
- [ ] Use secure session cookies
- [ ] Enable database connection pooling
- [ ] Set up monitoring and logging

---

## 🆘 Troubleshooting Commands

### View All Logs:
```powershell
docker-compose logs -f
```

### View Backend Logs Only:
```powershell
docker-compose logs backend -f
```

### View Frontend Logs Only:
```powershell
docker-compose logs frontend -f
```

### Check Database Connection:
```powershell
docker-compose exec db psql -U demo -d hiking_demo -c "SELECT COUNT(*) FROM trails;"
```

### Re-run Migrations:
```powershell
docker-compose exec backend flask db upgrade
```

### Re-seed Data:
```powershell
docker-compose exec backend python seed_mass_trails.py
```

### Enter Backend Shell:
```powershell
docker-compose exec backend bash
```

### Enter Database Shell:
```powershell
docker-compose exec db psql -U demo -d hiking_demo
```

---

## 🎓 Architecture Overview

```
┌─────────────────┐
│   User Browser  │
│  (Port 3000)    │
└────────┬────────┘
         │
         ↓ HTTP Requests
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
│  - Dashboard    │
│  - MapComponent │
│  - TrailCard    │
└────────┬────────┘
         │
         ↓ API Calls (Axios)
┌─────────────────┐
│  Flask Backend  │
│   (Port 5000)   │
│  - Trail Routes │
│  - Auth Routes  │
│  - CORS Enabled │
└────────┬────────┘
         │
         ↓ SQL Queries
┌─────────────────┐
│   PostgreSQL    │
│   + PostGIS     │
│  (Port 5432)    │
│  - Users Table  │
│  - Trails Table │
│  - Favorites    │
└─────────────────┘

External APIs:
├─ Google Maps API (geocoding, map display)
└─ WeatherStack API (optional weather data)
```

---

## ✅ Quick Start Summary

1. **Ensure Docker Desktop is running**
2. **Run:** `.\start.ps1` or `.\start.bat`
3. **Wait:** ~30 seconds for all services to start
4. **Open:** http://localhost:3000
5. **Search:** Type a city name and click Search
6. **Explore:** Click trail cards to see details and map highlighting

---

## 📞 Support

### Documentation Files:
- `AUTHENTICATION.md` - Authentication system details
- `NEW_FEATURES.md` - Feature documentation
- `TRAIL_HIGHLIGHTING.md` - Map highlighting feature
- `QUICK_START.md` - Quick start guide
- `TESTING_GUIDE.md` - Testing instructions

### Common Commands Reference:
```powershell
# Start
.\start.ps1

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Full rebuild
docker-compose down && docker-compose up -d --build
```

---

## 🎉 You're All Set!

Your HikingTrail application is now running and ready to use. 

**Next Steps:**
1. Open http://localhost:3000
2. Search for trails near "Boston" or "Worcester"
3. Click on trail cards to see details
4. Create an account to save favorites
5. Enjoy exploring Massachusetts hiking trails! 🥾

---

**Happy Hiking!** 🏔️🌲