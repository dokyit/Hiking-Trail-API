# Hiking Trail API - Startup Script
# PowerShell version for better Windows compatibility

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "🥾 Hiking Trail API - Starting Up..." -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again." -ForegroundColor Red
    pause
    exit 1
}

# Step 2: Check .env file
Write-Host ""
Write-Host "[2/6] Checking environment variables..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: Please add your API keys to .env file:" -ForegroundColor Yellow
        Write-Host "   - GOOGLE_MAPS_KEY" -ForegroundColor Yellow
        Write-Host "   - WEATHERSTACK_KEY" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Opening .env file in notepad..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        notepad .env
        Write-Host ""
        Write-Host "After adding your API keys, press any key to continue..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-Host "Creating new .env file..." -ForegroundColor Yellow
        @"
# API Keys (REQUIRED)
GOOGLE_MAPS_KEY=your_google_maps_api_key_here
WEATHERSTACK_KEY=your_weatherstack_api_key_here

# Database (for local development)
DATABASE_URL=postgresql://demo:TPsg84210@localhost:5432/hiking_demo

# Redis (using Redis Cloud)
REDIS_URL=redis://:qoqro3-dykqIv-bavmyh@redis-17704.c284.us-east1-2.gce.redns.redis-cloud.com:17704/0

# Flask
SECRET_KEY=dev-secret-key-change-in-production
JWT_SECRET_KEY=dev-jwt-secret-change-in-production
FLASK_ENV=development
"@ | Out-File -FilePath .env -Encoding UTF8
        Write-Host ""
        Write-Host "Opening .env file - please add your API keys..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        notepad .env
        Write-Host ""
        Write-Host "After adding your API keys, press any key to continue..." -ForegroundColor Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
}
Write-Host "✅ Environment file exists" -ForegroundColor Green

# Step 3: Cleanup old containers
Write-Host ""
Write-Host "[3/6] Cleaning up old containers..." -ForegroundColor Yellow
docker-compose down 2>&1 | Out-Null
Write-Host "✅ Cleanup complete" -ForegroundColor Green

# Step 4: Build and start services
Write-Host ""
Write-Host "[4/6] Building and starting services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Gray
docker-compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Failed to start services!" -ForegroundColor Red
    Write-Host "Check Docker Desktop and try again." -ForegroundColor Red
    pause
    exit 1
}
Write-Host "✅ Services started" -ForegroundColor Green

# Step 5: Wait for database
Write-Host ""
Write-Host "[5/6] Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "✅ Database ready" -ForegroundColor Green

# Step 6: Setup database
Write-Host ""
Write-Host "[6/6] Setting up database..." -ForegroundColor Yellow

Write-Host "Running migrations..." -ForegroundColor Gray
docker-compose exec -T backend flask db upgrade 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration may have failed, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "✅ Migrations complete" -ForegroundColor Green
}

Write-Host "Seeding trail data..." -ForegroundColor Gray
docker-compose exec -T backend python seed_mass_trails.py 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seeding may have failed, but continuing..." -ForegroundColor Yellow
} else {
    Write-Host "✅ Trail data seeded" -ForegroundColor Green
}

# Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Application Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:3000" -ForegroundColor White
Write-Host "🔧 Backend:  " -NoNewline -ForegroundColor Cyan
Write-Host "http://localhost:5000" -ForegroundColor White
Write-Host "🗄️  Database: " -NoNewline -ForegroundColor Cyan
Write-Host "localhost:5432" -ForegroundColor White
Write-Host ""
Write-Host "📋 Useful Commands:" -ForegroundColor Cyan
Write-Host "   View logs:    " -NoNewline -ForegroundColor Gray
Write-Host "docker-compose logs -f" -ForegroundColor White
Write-Host "   Stop:         " -NoNewline -ForegroundColor Gray
Write-Host "docker-compose down" -ForegroundColor White
Write-Host "   Restart:      " -NoNewline -ForegroundColor Gray
Write-Host "docker-compose restart" -ForegroundColor White
Write-Host ""

# Open browser
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press any key to view logs (Ctrl+C to exit logs)..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
docker-compose logs -f
