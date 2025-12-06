# ✅ Render Deployment Checklist

Quick reference guide for deploying to Render.com

## 📋 Pre-Deployment Checklist

### Local Setup
- [ ] Create `.env` file with your API keys (copy from `.env.example`)
- [ ] Make `build.sh` executable: `chmod +x build.sh` or `git update-index --chmod=+x build.sh`
- [ ] Test app locally to ensure it works
- [ ] Commit all changes to git
- [ ] Push to GitHub

### GitHub Repository
- [ ] Code pushed to main branch
- [ ] `.env` file NOT committed (check `.gitignore`)
- [ ] All files committed:
  - `render.yaml`
  - `build.sh`
  - `frontend/src/config.js`
  - Updated frontend files with `API_URL`
  - `RENDER_DEPLOYMENT.md`

---

## 🚀 Render Setup Steps

### 1. Create PostgreSQL Database (5 min)
- [ ] Sign up/login at https://dashboard.render.com
- [ ] New + → PostgreSQL
- [ ] Name: `hiking-trail-db`
- [ ] Region: Oregon (or closest to you)
- [ ] Plan: Free
- [ ] Enable PostGIS extension:
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  ```

### 2. Create Redis Instance (2 min)
- [ ] New + → Redis
- [ ] Name: `hiking-trail-cache`
- [ ] Region: Same as database
- [ ] Plan: Free
- [ ] Maxmemory Policy: `allkeys-lru`

### 3. Deploy Backend (10 min)
- [ ] New + → Web Service
- [ ] Connect GitHub repository
- [ ] Name: `hiking-trail-backend`
- [ ] Region: Same as database
- [ ] Build Command: `./build.sh`
- [ ] Start Command: `gunicorn -w 4 -b 0.0.0.0:$PORT run:app`
- [ ] Add Environment Variables:
  - [ ] `DATABASE_URL` (from database)
  - [ ] `REDIS_URL` (from Redis)
  - [ ] `GOOGLE_MAPS_KEY` = `AIzaSyBFkhKav7XM4-j2IsyMNNFCNrfXa4GUIOI`
  - [ ] `WEATHERSTACK_KEY` = `d7f9230e4f78afae248b5ca81a55c040`
  - [ ] `SECRET_KEY` (generate)
  - [ ] `JWT_SECRET_KEY` (generate)
  - [ ] `FLASK_ENV` = `production`
  - [ ] `PYTHON_VERSION` = `3.10.0`
- [ ] Wait for build to complete
- [ ] **Copy backend URL** (e.g., `https://hiking-trail-backend.onrender.com`)

### 4. Deploy Frontend (5 min)
- [ ] New + → Static Site
- [ ] Connect same GitHub repository
- [ ] Name: `hiking-trail-frontend`
- [ ] Region: Same as backend
- [ ] Build Command: `cd frontend && npm install && npm run build`
- [ ] Publish Directory: `frontend/build`
- [ ] Add Environment Variables:
  - [ ] `REACT_APP_GOOGLE_MAPS_KEY` = `AIzaSyBFkhKav7XM4-j2IsyMNNFCNrfXa4GUIOI`
  - [ ] `REACT_APP_API_URL` = `https://hiking-trail-backend.onrender.com` (YOUR backend URL)
- [ ] Wait for build to complete

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Open frontend URL
- [ ] Map loads (shows Boston area)
- [ ] Search for "Cambridge" - trails appear
- [ ] Search for "Worcester" - trails appear
- [ ] Click trail card - modal opens
- [ ] Weather widget shows data
- [ ] Favorites button works

### Backend API Tests
Test directly with curl:
```bash
curl https://hiking-trail-backend.onrender.com/api/trails/search?city=Boston
```
- [ ] Returns JSON with trails
- [ ] No errors in response

### Browser Console
- [ ] Press F12 → Console
- [ ] No CORS errors
- [ ] No 404 errors
- [ ] No API key errors

---

## 🐛 Common Issues & Fixes

### ❌ "Permission denied: ./build.sh"
```bash
chmod +x build.sh
git add build.sh
git commit -m "Make build.sh executable"
git push
```

### ❌ "No trails found"
- Go to Render Dashboard → Backend Service → Shell
- Run: `python seed_mass_trails.py`

### ❌ Map doesn't load
- Check `REACT_APP_GOOGLE_MAPS_KEY` in frontend env vars
- Verify billing enabled on Google Cloud Console
- Check browser console for errors

### ❌ "Network Error" in frontend
- Verify `REACT_APP_API_URL` is set correctly
- Must be HTTPS URL of backend (no trailing slash)
- Rebuild frontend after fixing

### ❌ CORS errors
- Already fixed! Flask-CORS is installed
- If still issues, check `app/__init__.py` has CORS enabled

### ❌ Database migration errors
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
Then redeploy backend

---

## 📝 After Deployment

### Keep App Warm (Optional)
Use [UptimeRobot](https://uptimerobot.com) (free):
- [ ] Sign up at uptimerobot.com
- [ ] Add HTTP(s) monitor
- [ ] URL: `https://hiking-trail-backend.onrender.com/api/trails/search?city=Boston`
- [ ] Interval: 5 minutes

### Share Your App
- [ ] Frontend URL: `https://hiking-trail-frontend.onrender.com`
- [ ] Share with friends/teammates
- [ ] No API keys needed by users! ✅

### Monitor Your App
- [ ] Set up Render notifications (Settings → Notifications)
- [ ] Check metrics regularly (CPU, memory, requests)
- [ ] Review logs for errors

---

## 🔄 Updating Your App

When you make code changes:
```bash
git add .
git commit -m "Your update message"
git push
```
Render automatically rebuilds and deploys! 🎉

---

## 💰 Free Tier Reminders

- Web services spin down after 15 min inactivity (30s cold start)
- PostgreSQL expires after 90 days (recreate and reseed)
- Redis: 25 MB storage limit
- 750 hours/month per web service (enough for 24/7)

---

## 📞 Need Help?

- Full Guide: See `RENDER_DEPLOYMENT.md`
- Render Docs: https://render.com/docs
- Render Status: https://status.render.com
- Team Support: Contact your project team

---

**Total Deployment Time: ~30 minutes**

**You're all set! Happy hiking! 🥾🏔️**