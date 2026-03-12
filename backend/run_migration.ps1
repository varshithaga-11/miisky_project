# MySQL to PostgreSQL Migration Script
# Run this from the backend folder: .\run_migration.ps1

Write-Host "=== MySQL to PostgreSQL Migration ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Docker not running" }
} catch {
    Write-Host "ERROR: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

Write-Host "Docker is running. Starting pgloader migration..." -ForegroundColor Green
Write-Host ""

docker-compose -f docker-compose.migration.yml run --rm pgloader

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Migration completed successfully!" -ForegroundColor Green
    Write-Host "You can now use PostgreSQL with your Django app." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Migration failed. Check the error above." -ForegroundColor Red
    Write-Host "See MIGRATE_MYSQL_TO_POSTGRES.md for troubleshooting." -ForegroundColor Yellow
    exit 1
}
