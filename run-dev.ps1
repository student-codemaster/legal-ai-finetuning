# run-dev.ps1
# Convenience script to create a venv (if missing), install backend deps,
# initialize the DB, start the backend (uvicorn) in a new PowerShell window,
# then start the frontend dev server in the current window.

param(
    [string]$PythonExe = "python",
    [int]$BackendPort = 8001
)

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $RepoRoot

Write-Host "Repository root: $RepoRoot"

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment (.venv)..."
    & $PythonExe -m venv .venv
}

Write-Host "Activating virtual environment..."
. .\.venv\Scripts\Activate.ps1

if (Test-Path "backend/requirements.txt") {
    Write-Host "Installing backend requirements (this can take several minutes)..."
    pip install -r backend/requirements.txt
}

Write-Host "Setting DATABASE_URL to sqlite:///./legal_dev.db"
$env:DATABASE_URL = "sqlite:///./legal_dev.db"

Write-Host "Initializing database (creating admin user and seed laws)..."
try {
    python -c "from backend.database import init_database; init_database(); print('DB init completed')"
} catch {
    Write-Warning "Database initialization failed: $_"
}

Write-Host "Starting backend in a new PowerShell window on port $BackendPort..."
$backendCommand = "`$env:DATABASE_URL='sqlite:///./legal_dev.db'; .\.venv\Scripts\Activate.ps1; python -m uvicorn backend.app:app --reload --port $BackendPort"
Start-Process powershell -ArgumentList @("-NoExit","-Command", $backendCommand)

if (Test-Path "lawease") {
    Write-Host "Starting frontend (lawease)..."
    Push-Location "lawease"
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing frontend dependencies (npm install)..."
        npm install
    }
    Write-Host "Running: npm run dev"
    npm run dev
    Pop-Location
} else {
    Write-Warning "Frontend folder 'lawease' not found. Backend started only."
}
