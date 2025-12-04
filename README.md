
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

=======
>>>>>>> 38a0c8b8bb6a5fa5ceb05a6dd584e294765d68ad
⚖️ LawEase – AI Legal Simplifier  
Intelligent Legal NLP Suite with Multilingual Summarization and Simplification

> LawEase is an AI-powered platform designed to simplify, summarize, and interpret complex legal documents in multiple Indian languages (English, Hindi, Tamil, Kannada).  
> It leverages fine-tuned transformer models (BART/mBART) and integrates with a legal knowledge base to provide quick, accessible, and legally accurate explanations.


Project Overview

LawEase transforms raw legal text — such as *IPC sections, Articles, or case judgments* — into concise, simplified summaries while linking to relevant laws.

 Features
- AI Summarization – Fine-tuned BART/mBART for legal text summarization  
- Simplification – Converts complex legal language into simpler terms  
- Multilingual Support – English, Hindi, Tamil, Kannada  
- Model Fine-tuning – Upload JSON datasets and fine-tune custom BART/mBART models  
- Law Linking – Auto-links referenced IPC sections and legal articles  
- Database Integration – MySQL/PostgreSQL via SQLAlchemy ORM  
- User Management – Signup, Login, JWT authentication, role-based access  
- User Dashboard– View personal query history and summaries  
- Admin Dashboard – Manage models, import datasets, and activate fine-tuned versions  
- Modern UI – React + Tailwind + Vite frontend with futuristic law-tech design  

---

## 🏗️ System Architecture
┌──────────────────────────┐
│ Frontend (Vite) │
│ React + Tailwind + Axios│
└──────────────┬───────────┘
│ REST API
▼
┌──────────────────────────┐
│ FastAPI Backend (NLP) │
│ Summarization, AI logic │
│ Fine-tuning, Translation │
└──────────────┬───────────┘
│ SQLAlchemy ORM
▼
┌──────────────────────────┐
│ MySQL Database │
│ users / queries / laws │
└──────────────────────────┘

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React (Vite) + TailwindCSS + Axios |
| **Backend** | FastAPI (Python 3.10+) |
| **NLP Models** | Facebook BART / mBART-50 |
| **Database** | MySQL (SQLAlchemy ORM) |
| **Auth** | JWT (PyJWT + FastAPI Security) |
| **Deployment Ready** | Docker / Uvicorn / Nginx |
| **Dataset** | `laws_dataset.csv`, `ipc_qa.json`, `train_data.json` |

---

## 🚀 Setup Instructions

### 🧩 Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Server
- Git, pip, and npm installed

---

### 🖥️ Backend Setup (FastAPI)

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/lawease.git
cd lawease/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure MySQL connection
# Update backend/config.py
DATABASE_URL = "mysql+pymysql://root:<password>@localhost/lawease"

# 5. Run database migrations
python -m backend.database

# 6. Import laws dataset (optional)
python -m backend.scripts.import_laws_csv

# 7. Start backend server
uvicorn backend.app:app --reload --port 8000

##Frontend Setup (React + Vite)
cd ../lawease

# 1. Install dependencies
npm install

# 2. Run development server
npm run dev



