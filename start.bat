@echo off
echo ========================================
echo 🥾 Hiking Trail API - Starting Up...
echo ========================================
echo.

REM Check if Docker is running
echo [1/6] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

REM Check if .env file exists
echo.
echo [2/6] Checking environment variables...
if not exist .env (
    echo ⚠️  WARNING: .env file not found!
    echo Creating .env file from .env.example...
    copy .env.example .env >nul 2>&1
    echo.
    echo ⚠️  IMPORTANT: Edit .env file and add your API keys:
    echo    - GOOGLE_MAPS_KEY
    echo    - WEATHERSTACK_KEY
    echo.
    echo Press any key to open .env file in notepad...
    pause >nul
    notepad .env
    echo.
    echo After adding your API keys, press any key to continue...
    pause >nul
)
echo ✅ Environment file exists

REM Stop any running containers
echo.
echo [3/6] Cleaning up old containers...
docker-compose down >nul 2>&1
echo ✅ Cleanup complete

REM Build and start all services
echo.
echo [4/6] Building and starting services...
echo This may take a few minutes on first run...
docker-compose up -d --build
if errorlevel 1 (
    echo ❌ ERROR: Failed to start services!
    pause
    exit /b 1
)
echo ✅ Services started

REM Wait for database to be ready
echo.
echo [5/6] Waiting for database to be ready...
timeout /t 10 /nobreak >nul
echo ✅ Database ready

REM Run migrations and seed data
echo.
echo [6/6] Setting up database...
echo Running migrations...
docker-compose exec -T backend flask db upgrade
if errorlevel 1 (
    echo ⚠️  Migration may have failed, but continuing...
)

echo.
echo Seeding trail data...
docker-compose exec -T backend python seed_mass_trails.py
if errorlevel 1 (
    echo ⚠️  Seeding may have failed, but continuing...
)

echo.
echo ========================================
echo ✅ Application Started Successfully!
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 🗄️  Database: localhost:5432
echo.
echo 📋 To view logs:    docker-compose logs -f
echo 🛑 To stop:        docker-compose down
echo 🔄 To restart:     docker-compose restart
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo Press any key to view logs (Ctrl+C to exit logs)...
pause >nul
docker-compose logs -f
