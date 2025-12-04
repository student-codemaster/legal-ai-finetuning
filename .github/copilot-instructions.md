**Repository Purpose**
- **Overview:** This repo implements an AI-powered legal simplifier: a FastAPI backend (`backend/`) that extracts and processes legal documents, a small React front-end (`lawease/`), and local data/models under `backend/data` and `backend/models`.

**Big Picture Architecture**
- **Backend:** `backend/app.py` (FastAPI) exposes endpoints for file/text processing, user auth, model fine-tuning, and admin management. It uses SQLAlchemy models in `backend/database.py` to persist users, queries, laws, and training jobs.
- **ML Layer:** `backend/module3_ai.py` handles summarization/simplification and model training using `transformers` / `sentence-transformers`. It lazily initializes heavy ML objects and falls back to smaller defaults when unavailable.
- **Law Linking:** `backend/module4_lawlink.py` resolves references to law text using DB/CSV fallbacks, fuzzy matching, and sentence-transformers semantic search.
- **Frontend:** `lawease/src/api/backend.js` expects the API base at `http://127.0.0.1:8001` by default.

**Key Files & Responsibilities (quick refs)**
- `backend/app.py`: HTTP routes, auth helpers, upload handling, background fine-tune job orchestration. Example: language detection uses Unicode ranges (Hindi/Tamil/Kannada) in `process` and `process-text` endpoints.
- `backend/database.py`: SQLAlchemy models and `get_db()` dependency. DB initialized via `init_database()` which creates an admin user and seed laws.
- `backend/module3_ai.py`: ML initialization (`_init_pipelines()`), `summarize_text()`, `simplify_text()`, and `train_custom_bart_json()` for fine-tuning.
- `backend/module4_lawlink.py`: `get_law_info()` (exact, fuzzy, semantic), `ensure_laws_loaded()` lazy-loading and embedding creation.
- `backend/config.py`: All environment-driven settings (DB URL, model names, `EMBEDDING_MODEL`, `UPLOAD_DIR`). Use these env vars in tests/dev to change behavior.

**Developer Workflows & Commands**
- **Install deps (virtualenv, PowerShell):**
```
python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -r backend/requirements.txt
```
- **Run backend (dev, port aligned with frontend):**
```
# from repository root
$env:DATABASE_URL='sqlite:///./legal_dev.db'; python -m uvicorn backend.app:app --reload --port 8001
```
- **Run DB init (one-time):** import `backend.database.init_database()` from a small script or run `python -c "from backend.database import init_database; init_database()"` after environment is configured.
- **Run tests (pytest):** repository has no tests by default. Create `tests/` and run:
```
.\.venv\Scripts\Activate.ps1
pytest -q
```

**Project-specific Patterns & Conventions**
- **DB sessions:** uses `SessionLocal()` and explicit `db.close()` in `try/finally` blocks. When writing tests, reuse the `get_db()` dependency pattern or override `SQLALCHEMY_DATABASE_URL` to an in-memory SQLite for isolation.
- **ML lazy-loading:** heavy ML objects are initialized lazily (`_init_pipelines()` in `module3_ai.py`) — prefer unit tests that mock these pipelines instead of initializing real models.
- **Language detection:** implemented by checking Unicode codepoint ranges rather than external libraries — tests can generate short strings containing characters from those blocks to validate behavior.
- **Background jobs:** training runs in FastAPI `BackgroundTasks` and records `TrainJob` rows; unit tests should mock `train_custom_bart_json` to avoid heavy work.

**Integration Points & External Dependencies**
- Transformers / PyTorch / SentenceTransformers: heavy — development often requires GPU or time for downloads. Use env `USE_OFFLINE_MODELS=1` to force local-only behavior when models are cached.
- Tesseract / PyMuPDF / python-docx: used for file extraction in `module1_input.py` (OCR/extraction). Tests should mock `get_text()` when verifying pipeline endpoints.
- Database: default `sqlite:///./legal_dev.db`; set `DATABASE_URL` to a test DB for CI.

**Unit Test Guidance (practical examples)**
- Prefer small, fast units that mock heavy ML and IO. Example targets:
  - `module4_lawlink.get_law_info()` — can be tested using a mocked `LAW_DB` (assign `module4_lawlink.LAW_DB = {'ipc section 302':'Punishment for murder'}`) and asserting exact/fuzzy/none cases.
  - `app.process_text()` — call the function directly in tests while monkeypatching `summarize_text`, `simplify_text`, and `get_law_info` to return predictable values and using an in-memory DB.
  - `database.init_database()` — run against an ephemeral SQLite DB via `DATABASE_URL='sqlite:///:memory:'` to confirm tables and seed data are created.

**Quick Test Snippet (pytest)**
```
def test_get_law_info_exact(monkeypatch):
    from backend import module4_lawlink as ml
    ml.LAW_DB = {'ipc section 302':'Punishment for murder'}
    out = ml.get_law_info(['IPC Section 302'])
    assert 'IPC Section 302' in out and out['IPC Section 302']['match_type'].startswith('exact')
```

**What to Mock in Tests**
- `module3_ai.SUMMARIZER`, `module3_ai._init_pipelines`, or patch `summarize_text`/`simplify_text` to avoid invoking `transformers`.
- `module1_input.get_text` for file extraction.
- Database sessions where appropriate, or use an ephemeral SQLite URL (`sqlite:///:memory:`) to run light integration tests.

**When to Edit Which Files**
- Change `backend/config.py` to add or expose new env settings.
- Add/replace models in `backend/database.py` when DB schema changes; remember to run migrations (not included) or rely on `Base.metadata.create_all()` behavior.

If anything here is unclear or you want examples for the exact tests to add (I can scaffold `tests/` files and a CI workflow), tell me which area to prioritize and I will generate runnable test files and commands.
