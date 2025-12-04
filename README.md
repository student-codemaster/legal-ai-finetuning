.\run-dev.ps1# Legal AI Fine-tuning (Lawease)

This repository contains a FastAPI backend and a small React frontend (Vite) for an AI-powered legal simplifier.

Quick start (Windows PowerShell):

1. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install backend dependencies (may take time for ML packages):

```powershell
pip install -r backend/requirements.txt
pip install pytest
```

3. Initialize the database (one-time):

```powershell
$env:DATABASE_URL='sqlite:///./legal_dev.db'
python -c "from backend.init_db import init_database; init_database(); print('DB_INIT_DONE')"
```

4. Run the backend (port 8001 to match frontend):

```powershell
$env:DATABASE_URL='sqlite:///./legal_dev.db'
python -m uvicorn backend.app:app --reload --port 8001
```

5. Run the frontend (new terminal):

```powershell
cd lawease
npm install
npm run dev
```

6. Run tests (lightweight, mocks):

```powershell
pytest -q
```

If you encounter errors, capture logs as described in the repository `.github/copilot-instructions.md` and paste them in an issue or here so the maintainer can help.
