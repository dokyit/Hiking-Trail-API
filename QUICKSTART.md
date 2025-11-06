# Massachusetts Trail Finder - Quick Start Guide

## 🚀 Getting Started (5 Minutes)

### Prerequisites
- Docker and Docker Compose installed
- Windows PowerShell (you're already using it!)

### 1. Start the Application

```powershell
cd C:\Users\tobyj\HikingTrail
docker-compose up -d
```

Wait about 30 seconds for all services to start.

### 2. Access the Application

Open your web browser and go to:
```
http://localhost:3000
```

You should see the **Massachusetts Trail Finder** homepage with:
- A search bar at the top
- Weather information
- An interactive map on the right

### 3. Search for Trails

1. Type a city name in Massachusetts (examples: Boston, Cambridge, Worcester, Springfield)
2. Click the **Search** button
3. View trail results in the left panel
4. See trail locations marked on the map

### 4. View Trail Details

- Click on any trail card in the left panel
- A modal will open showing:
  - Trail name and location
  - Difficulty level
  - Length and elevation gain
  - Required gear and supplies
  - Full description

---

## ⚠️ Important Note: No Trail Data Yet

Currently, **the trail database is empty**. When you search, you'll see:
```json
{"trails": [], "map_center": {"lat": 42.xxx, "lng": -71.xxx}}
```

This is normal! The API is working correctly, but we need to import the trail data.

---

## 📦 Load Trail Data (Next Step)

The trail data file `mass_trails.geojson` is already in your project folder. To load it:

### Option 1: Using ogr2ogr (Recommended)

```powershell
docker-compose exec backend ogr2ogr -f "PostgreSQL" PG:"dbname=hiking_db user=postgres password=postgres host=db" mass_trails.geojson -nln "trails" -lco GEOMETRY_NAME=geom -lco SPATIAL_INDEX=GIST
```

### Option 2: Python Script (Coming Soon)

A Python script to process and calculate difficulty ratings will be provided.

---

## 🔍 Testing the API Directly

You can test the backend API without the frontend:

```powershell
# Search for trails near Boston
curl "http://localhost:5000/api/trails/search?city=Boston"

# Get weather for Boston
curl "http://localhost:5000/api/weather?city=Boston"

# Get specific trail details (replace 1 with actual trail ID)
curl "http://localhost:5000/api/trails/1"
```

---

## 🛠️ Useful Commands

### Check if containers are running:
```powershell
docker-compose ps
```

You should see 4 services running:
- `hikingtrail-backend-1` (Flask API on port 5000)
- `hikingtrail-frontend-1` (React app on port 3000)
- `hikingtrail-db-1` (PostgreSQL + PostGIS on port 5432)
- `hikingtrail-redis-1` (Redis cache on port 6379)

### View logs:
```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop the application:
```powershell
docker-compose down
```

### Restart after code changes:
```powershell
docker-compose down
docker-compose up -d --build
```

---

## ✅ Current Status

**What's Working:**
- ✅ Backend API (Flask) running on port 5000
- ✅ Frontend (React) running on port 3000
- ✅ Database (PostgreSQL + PostGIS) ready
- ✅ Redis cache active
- ✅ Trail search endpoint (no auth required)
- ✅ Weather API integration
- ✅ Interactive Google Maps
- ✅ Trail detail modal

**What's Not Working Yet:**
- ❌ No trail data in database (empty results)
- ❌ Authentication removed (login/register disabled)
- ❌ Favorites feature removed

---

## 🎯 Features

### Trail Search
- Search trails within 25 miles of any Massachusetts city
- Real-time geocoding using Google Maps API
- Fast spatial queries using PostGIS

### Difficulty Ratings
Trails are rated 1-4 based on distance and elevation:
- 🟢 **Easy (1)**: Short distances, minimal elevation
- 🟡 **Moderate (2)**: Medium distances and elevation
- 🟠 **Hard (3)**: Longer distances or significant elevation
- 🔴 **Extremely Hard (4)**: Very long distances and/or extreme elevation

### Gear Recommendations
Each difficulty level shows required gear:
- Easy: Map, water, snacks, sun protection, first-aid
- Moderate: Above + rain gear, headlamp
- Hard: Above + fire starter, knife, emergency shelter
- Extremely Hard: Above + extra rations, water purification, specialized gear

### Weather Integration
- Real-time weather for searched cities
- Temperature and conditions display
- Powered by Weatherstack API

---

## 🐛 Troubleshooting

### Frontend not loading?
```powershell
docker-compose logs frontend
```
Look for "Compiled successfully!" message.

### Backend errors?
```powershell
docker-compose logs backend
```
Check for Python errors or database connection issues.

### Database connection issues?
```powershell
docker-compose restart db
docker-compose restart backend
```

### Clear everything and start fresh:
```powershell
docker-compose down -v  # Warning: deletes database data!
docker-compose up -d --build
docker-compose exec backend flask db upgrade
```

---

## 📝 Environment Variables

Required in `.env` or `docker-compose.yml`:

```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=hiking_db

# Flask
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
FLASK_ENV=development

# External APIs
GOOGLE_MAPS_KEY=your-google-maps-api-key
WEATHERSTACK_KEY=your-weatherstack-api-key

# Frontend
REACT_APP_GOOGLE_MAPS_KEY=your-google-maps-api-key
```

---

## 📚 Next Steps

1. **Load trail data** (see above)
2. **Test search functionality** with real trail data
3. **Customize styling** in frontend components
4. **Add more features**:
   - Trail reviews
   - Photo uploads
   - Trail conditions updates
   - Difficulty filters
   - Distance range filters

---

## 📞 Need Help?

Check these files for detailed information:
- `AUTHENTICATION_REMOVED.md` - What changed when auth was removed
- `README.md` - Original project documentation
- `docker-compose.yml` - Service configuration

---

## 🎉 You're All Set!

Your Massachusetts Trail Finder is running! Once you load the trail data, you'll be able to:
1. Search for trails by city
2. View trails on an interactive map
3. See detailed trail information
4. Get gear recommendations
5. Check weather conditions

**Happy Trail Finding! 🥾🌲**