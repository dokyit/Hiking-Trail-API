# Hiking Trail Explorer

A full-stack platform for discovering Massachusetts hiking trails. Users can search by city, visualize routes on an interactive map, inspect trail details, monitor live weather, and view realistic hiking ETAs. The project provides a Docker-first workflow via `start.ps1`, manual development instructions (Flask API + React SPA), and an Electron desktop wrapper.

---

## Table of Contents

1. [Quick Start (Docker + PowerShell)](#quick-start-docker--powershell)
2. [Project Structure](#project-structure)
3. [Features](#features)
4. [Prerequisites](#prerequisites)
5. [Environment Configuration](#environment-configuration)
6. [Manual Backend Setup (Flask API)](#manual-backend-setup-flask-api)
7. [Manual Frontend Setup (React SPA)](#manual-frontend-setup-react-spa)
8. [Desktop Application (Electron Wrapper)](#desktop-application-electron-wrapper)
9. [Building Executables](#building-executables)
10. [Database & Data Seeding](#database--data-seeding)
11. [Running Tests](#running-tests)
12. [Troubleshooting](#troubleshooting)


---

## Quick Start (Docker + PowerShell)

The **recommended** way to run the entire stack on Windows is to execute the `start.ps1` script from the project root. This guided workflow validates prerequisites, prepares configuration, and launches all services automatically.

### Step-by-step instructions

1. **Install prerequisites**
   - Docker Desktop (latest stable release).
   - PowerShell 5.1 (Windows PowerShell) or PowerShell 7+.
   - Valid API keys for Google Maps and WeatherStack.

2. **Open PowerShell as Administrator**  
   - Navigate to the cloned repository root (the folder containing `start.ps1`).

3. **Run the startup script**
  
   powershell -ExecutionPolicy Bypass -File .\start.ps1
   

4. **Follow the interactive prompts**
   - The script checks Docker status and exits gracefully if Docker Desktop is not running.
   - If `.env` is missing, you can choose to copy `.env.example` or generate a placeholder file.
   - When prompted, add your API keys (`GOOGLE_MAPS_KEY`, `WEATHERSTACK_KEY`) to the `.env` file, then return to the script window and press any key to continue.

5. **Observe automated setup**
   - Containers build and start via `docker-compose up -d --build`.
   - Database migrations execute (`flask db upgrade`).
   - Trail data seeds automatically (`python seed_mass_trails.py`).
   - After services initialize, your default browser opens `http://localhost:3000`.

6. **Monitor or stop services when needed**
   
   docker-compose logs -f
   
   
   docker-compose down
   

> **Important:** Evaluators and graders should always launch the application using `start.ps1` unless they explicitly need to follow the manual setup paths.

---

## Project Structure


HikingTrail/
├── app/                  # Flask application (API, models, routes)
├── frontend/             # React single-page application
├── desktop/              # Electron wrapper (desktop packaging)
├── data_temp/            # Intermediate geospatial exports
├── MAD_Trails/           # Source trail datasets
├── scripts/              # Utility helpers (e.g., data seeding)
├── migrations/           # Alembic migration history
├── instance/             # Flask instance data
├── requirements.txt      # Python dependencies
├── run.py                # Flask development entry point
├── seed_mass_trails.py   # Trail seeding utility
└── start.ps1             # Docker-based quick start script


---

## Features

- **Trail Search:** Locate trails within ~25 miles of any Massachusetts city.
- **Interactive Map:** Render trail geometry using the Google Maps SDK.
- **Difficulty & ETA:** Automatically computed grades and hiking time estimates.
- **Weather Integration:** Live conditions sourced from the WeatherStack API.
- **Favorites & Auth:** JWT-protected endpoints for managing saved trails.
- **Desktop Build:** Electron wrapper for a native-like experience (API still required).

---

## Prerequisites

| Component       | Minimum Version | Notes                                                       |
|-----------------|-----------------|-------------------------------------------------------------|
| Docker Desktop  | Latest stable   | Required for the `start.ps1` workflow                       |
| PowerShell      | 5.1 / 7+        | Used to execute `start.ps1`                                 |
| Python          | 3.10            | Needed for manual backend development                       |
| Node.js         | 18 LTS          | Required for React and Electron                             |
| npm             | 9+              | Bundled with Node 18                                        |
| PostgreSQL      | 15              | Must include the PostGIS extension (manual setup only)      |
| Redis           | 6               | Provides caching for geocoding and weather lookups          |
| Git             | Any modern      | For source control / cloning                                |

> **Windows tip:** Enable WSL 2 integration in Docker Desktop for improved container performance. If you opt for manual database setup, install PostgreSQL with StackBuilder to add PostGIS easily.

---

## Environment Configuration

Secrets and configuration values are sourced from environment variables. For local development, place them in `HikingTrail/.env`. **Never commit real secrets.**

```/dev/null/env-example.env#L1-26
# Flask secrets
SECRET_KEY=replace-with-strong-random-string
JWT_SECRET_KEY=replace-with-strong-random-string

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hiking_db
DB_USER=postgres
DB_PASSWORD=super_secret_password
DATABASE_URL=postgresql://postgres:super_secret_password@localhost:5432/hiking_db

# Redis cache
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379/0

# External APIs (bring your own keys)
GOOGLE_MAPS_KEY=your_google_maps_key
WEATHERSTACK_KEY=your_weatherstack_key

# Frontend configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key

# Electron configuration (optional)
ELECTRON_APP_ID=com.hikingtrail.desktop
ELECTRON_API_BASE_URL=http://localhost:5000
ELECTRON_RENDERER_ORIGIN=file://
```

### Obtaining API Keys

- **Google Maps Platform**
  1. Visit https://console.cloud.google.com/
  2. Enable **Maps JavaScript API** and **Geocoding API**.
  3. Generate an API key and restrict usage (HTTP referrers / IPs).

- **WeatherStack**
  1. Sign up at https://weatherstack.com/
  2. Copy your API key from the dashboard (free tier works for local testing).

---

## Manual Backend Setup (Flask API)

Only follow this path if you are intentionally skipping `start.ps1`.

1. **Create and activate a virtual environment**
  
   cd HikingTrail
   python -m venv .venv
   .\.venv\Scripts\activate
   
   _(macOS/Linux: `source .venv/bin/activate`)_ 

2. **Install dependencies**
   
   pip install --upgrade pip
   pip install -r requirements.txt
   

3. **Run database migrations**
   
   flask db upgrade
   

4. **Seed trail data**
   
   python seed_mass_trails.py
   

5. **Start the API**
   
   python run.py
   
   The API listens on `http://localhost:5000`.

---

## Manual Frontend Setup (React SPA)

1. **Install dependencies**
   
   cd HikingTrail/frontend
   npm install
   

2. **Optional: create `frontend/.env`**
   
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_MAPS_KEY=your_google_maps_key
   

3. **Start the development server**
   
   npm start
   
   The React app is served at `http://localhost:3000`.

4. **Build production assets**
   
   npm run build
   
   Outputs to `frontend/build/`.

---

## Desktop Application (Electron Wrapper)

The `desktop/` project packages the React build and communicates with the Flask API.

1. **Install dependencies**
   
   cd HikingTrail/desktop
   npm install
   npm run setup
   
   `npm run setup` installs dependencies for both the Electron and React workspaces.

2. **Development mode (Electron + React)**
   - Start the Flask API (`python run.py`).
   - Then run:
     
     npm run dev
     
   - Electron launches once the React dev server is reachable (`http://localhost:3000`).

3. **Preview with production build**
   
   npm run build:frontend
   npm start
   ```
   Electron serves static assets from `frontend/build/`.

---

## Building Executables

Packaging uses `electron-builder`; build on the target OS for best results.

1. **Prepare production assets**
   
   cd desktop
   npm run build:frontend
  

2. **Package platform binaries**
   
   npm run package
  
   Outputs (e.g., `.exe`, `.dmg`, `.AppImage`) land in `desktop/dist/`.

3. **Distribute responsibly**
   - Include the generated installer/binary.
   - Provide instructions reminding users to start the backend (via `start.ps1` or manual path) before launching the desktop app.
   - Never embed or ship actual API keys.

---

## Database & Data Seeding

1. **Enable PostGIS (manual DB only)**
   
   CREATE EXTENSION IF NOT EXISTS postgis;
   

2. **Seed data after migrations**
   
   python seed_mass_trails.py
   

3. **Optional reseed with reset**
   
   python seed_mass_trails.py --reset
   

---

## Running Tests

- **Backend**
  
  pytest
  

- **Frontend**
  
  cd frontend
  npm test
  

_End-to-end automation is not bundled by default; consider adding Cypress or Playwright for UI coverage._

---

## Troubleshooting

| Symptom                                | Suggested Fix                                                                                   |
|----------------------------------------|--------------------------------------------------------------------------------------------------|
| `start.ps1` reports Docker not running | Launch Docker Desktop, wait for the “Running” status, then re-run the script.                   |
| `.env` missing or incomplete           | Allow the script to generate a placeholder, then edit to add API keys before continuing.        |
| `flask db upgrade` fails               | Confirm PostGIS is enabled and `DATABASE_URL` targets a reachable database instance.            |
| Blank Google Map                       | Ensure `REACT_APP_GOOGLE_MAPS_KEY` is set and the key has billing enabled.                      |
| Weather panel empty                    | Check WeatherStack API key usage limits or network connectivity.                                |
| Electron app cannot reach API          | Verify `ELECTRON_API_BASE_URL` and allow the Electron origin (`file://`) in backend CORS config.|
| Redis connection errors                | Update Redis credentials or temporarily set `CACHE_TYPE=simple` for development.                |
---

**Happy hiking!** 🥾🌲
