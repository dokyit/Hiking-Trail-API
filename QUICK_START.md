# 🚀 Quick Start Guide

Run the entire Hiking Trail API application with one command!

---

## ⚡ Super Quick Start (3 Steps)

### 1. **Make sure Docker Desktop is running**
   - Open Docker Desktop application
   - Wait for it to fully start (green icon)

### 2. **Run the startup script**

**Option A - Double-click:**
```
start.bat
```
Just double-click `start.bat` in the project folder!

**Option B - PowerShell (recommended):**
```powershell
.\start.ps1
```

**Option C - Command Prompt:**
```cmd
start.bat
```

### 3. **Wait for browser to open**
   - Script will automatically open `http://localhost:3000`
   - If browser doesn't open, manually go to: **http://localhost:3000**

---

## 🎯 What the Script Does

The startup script automatically:

1. ✅ Checks Docker is running
2. ✅ Creates `.env` file if missing (will prompt for API keys)
3. ✅ Stops any old containers
4. ✅ Builds and starts all services (database, backend, frontend)
5. ✅ Waits for database to be ready
6. ✅ Runs database migrations
7. ✅ Seeds trail data (20 Massachusetts trails)
8. ✅ Opens your browser to http://localhost:3000

**First run takes ~5 minutes. Subsequent runs take ~30 seconds.**

---

## 🌐 What Gets Started

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | React app (main interface) |
| **Backend** | http://localhost:5000 | Flask API |
| **Database** | localhost:5432 | PostgreSQL with PostGIS |

---

## 🔑 API Keys Required

On first run, you'll be prompted to add API keys to `.env` file:

### 1. Google Maps API Key
- Get it from: https://console.cloud.google.com/
- Enable: Maps JavaScript API + Geocoding API
- Add to `.env`: `GOOGLE_MAPS_KEY=your_key_here`

### 2. WeatherStack API Key (optional)
- Get it from: https://weatherstack.com/
- Free tier: 1000 requests/month
- Add to `.env`: `WEATHERSTACK_KEY=your_key_here`

**Note:** The script will open `.env` in Notepad for you to add these keys.

---

## 🧪 Test the Application

### 1. Search for Trails
1. Open http://localhost:3000
2. Enter a Massachusetts city (e.g., "Boston", "Cambridge", "Worcester")
3. Click "Search"
4. See trails on the map and in the sidebar!

### 2. Filter by Difficulty
- Click difficulty badges to filter trails:
  - 🟢 **Easy** - < 3 miles, < 500 ft elevation
  - 🟡 **Moderate** - 3-6 miles OR 500-1500 ft
  - 🟠 **Hard** - 6-10 miles OR 1500-2500 ft
  - 🔴 **Extremely Hard** - > 10 miles OR > 2500 ft

### 3. Sort Trails
Use the dropdown to sort by:
- Name (A-Z)
- Difficulty (Easy to Hard)
- Distance (Shortest First)
- Elevation (Lowest First)

### 4. View Trail Details
- Click any trail card to see:
  - Full description
  - Difficulty level
  - Length and elevation
  - Recommended gear list
  - Location on map

### 5. Try Different Cities
Search for trails near:
- Boston
- Cambridge
- Springfield
- Worcester
- Cape Cod
- Berkshires (try "Great Barrington")

---

## 📊 What Trails Are Included

**20 real Massachusetts hiking trails:**

- Blue Hills Skyline Trail (Milton)
- Mount Greylock Summit Trail (Adams)
- Walden Pond Loop Trail (Concord)
- Monument Mountain Trail (Great Barrington)
- Cape Cod Rail Trail (Dennis to Wellfleet)
- Bash Bish Falls Trail (Mount Washington)
- Wachusett Mountain Trail (Princeton)
- Middlesex Fells Skyline Trail (Medford)
- And 12 more!

---

## 🛑 Stop the Application

```powershell
docker-compose down
```

Or just close Docker Desktop (will stop all containers).

---

## 🔄 Restart the Application

Just run the startup script again:
```powershell
.\start.ps1
```

Or manually:
```powershell
docker-compose up -d
```

---

## 📋 Useful Commands

```powershell
# View logs (see what's happening)
docker-compose logs -f

# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend
docker-compose restart frontend

# Rebuild after code changes
docker-compose up -d --build

# View running containers
docker ps

# Enter backend container (for debugging)
docker-compose exec backend bash

# Run migrations manually
docker-compose exec backend flask db upgrade

# Seed data manually
docker-compose exec backend python seed_mass_trails.py
```

---

## 🐛 Troubleshooting

### Issue 1: "Docker is not running"
**Solution:** Open Docker Desktop and wait for it to start

### Issue 2: "Port already in use"
**Solution:** Stop other applications using ports 3000, 5000, or 5432
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Stop Docker containers
docker-compose down
```

### Issue 3: Script fails with errors
**Solution:** Check Docker Desktop is running, then try:
```powershell
# Clean everything and start fresh
docker-compose down -v
docker system prune -f
.\start.ps1
```

### Issue 4: Map doesn't load
**Solution:** 
1. Check you added `GOOGLE_MAPS_KEY` to `.env`
2. Make sure billing is enabled on Google Cloud Console
3. Enable Maps JavaScript API

### Issue 5: No trails showing
**Solution:** 
```powershell
# Reseed the database
docker-compose exec backend python seed_mass_trails.py
```

### Issue 6: Frontend won't build
**Solution:**
```powershell
# Rebuild frontend
docker-compose up -d --build frontend
```

---

## 🔒 Authentication Features

Test the authentication system:

### 1. Register a User
- Use the registration page (if available)
- Or use cURL:
```powershell
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"email\":\"test@test.com\",\"password\":\"test123\"}'
```

### 2. Login
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"testuser\",\"password\":\"test123\"}'
```

### 3. View Favorites
- Click the "⭐ Favorites" button in the header
- Add trails by clicking the star on trail cards

---

## 📖 More Documentation

| File | Purpose |
|------|---------|
| `README.md` | Complete project overview |
| `AUTHENTICATION.md` | Authentication system guide |
| `AUTH_QUICKSTART.md` | Auth quick reference |
| `TESTING_GUIDE.md` | How to test the API |

---

## 🎉 You're Ready!

1. ✅ Run `start.ps1`
2. ✅ Wait for browser to open
3. ✅ Search for trails
4. ✅ Filter by difficulty
5. ✅ Sort trails
6. ✅ Enjoy hiking! 🥾

---

## ⏱️ Typical Startup Times

- **First run:** ~5 minutes (downloads images, builds containers)
- **Subsequent runs:** ~30 seconds (just starts containers)
- **After code changes:** ~2 minutes (rebuilds affected containers)

---

## 💡 Pro Tips

1. **Keep Docker Desktop running** - Speeds up startup
2. **Use PowerShell script** - Better error messages
3. **Check logs if stuck** - `docker-compose logs -f`
4. **Database persists** - Data saved between restarts
5. **Add API keys once** - Saved in `.env` file

---

**Need help?** Check the logs:
```powershell
docker-compose logs -f
```

**Happy hiking! 🥾🏔️**