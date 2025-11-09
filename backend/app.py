from datetime import datetime, timedelta
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .database import User, SessionLocal, get_db
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
#stArt

oauth2_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Body, HTTPException, Query, Form
from fastapi.middleware.cors import CORSMiddleware
import os, shutil, uuid, logging
from pathlib import Path
# Authentication utilities are intentionally not imported here to keep the
# development server simple and avoid hard runtime dependencies. For
# production-ready auth, add an `auth.py` module and enable secure flows.

# Password hashing
# Use PBKDF2-SHA256 via passlib to avoid bcrypt native binding issues in some environments.
# This is secure for development; you can switch to bcrypt if your deployment supports it.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash a password using the configured passlib context."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # If verification fails due to unexpected format, return False
        return False

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Core modules
from .module1_input import get_text
from .module2_processing import clean_text, extract_articles, preprocess_for_ai
from .module3_ai import (
    summarize_text,
    simplify_text,
    train_custom_bart_json,
    reload_summarizer,
)
from .module4_lawlink import get_law_info
from .database import SessionLocal, UserQuery, Law, ModelVersion, TrainJob, UserFeedback
from .config import UPLOAD_DIR, SQLALCHEMY_DATABASE_URL


# ==========================================================
# ⚙️ Logging & Directory Setup
# ==========================================================
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join("logs", "app.log"))
    ]
)
logger = logging.getLogger("AI_Legal_Simplifier")

# Create required directories
required_dirs = [
    UPLOAD_DIR,
    "backend/models",
    "backend/models/active",
    "backend/data",
    "logs",
]
for d in required_dirs:
    try:
        Path(d).mkdir(parents=True, exist_ok=True)
        logger.info(f"✓ Directory ready: {d}")
    except Exception as e:
        logger.warning(f"! Could not create directory {d}: {e}")

# Ensure SQLite file is writable if using SQLite
if "sqlite" in str(SQLALCHEMY_DATABASE_URL).lower():
    db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(os.path.abspath(db_path))
    Path(db_dir).mkdir(parents=True, exist_ok=True)
    logger.info(f"✓ SQLite directory ready: {db_dir}")


# ==========================================================
# 🚀 Initialize FastAPI App
# ==========================================================
app = FastAPI(title="AI Legal Simplifier – Intelligent Legal NLP Suite")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔒 Restrict this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# 🏠 Health Check
# ==========================================================
@app.get("/")
def home():
    """Basic health check endpoint."""
    return {
        "status": "✅ AI Legal Simplifier backend is running!",
        "message": "Welcome to the multilingual AI-powered legal simplifier API."
    }


# ==========================================================
# 📄 Process Uploaded File (Multilingual)
# ==========================================================
@app.post("/process")
async def process_file(
    file: UploadFile = File(...),
    lang: str = Query(default=None, description="Optional target output language (auto-detected if not provided)")
):
    """
    Upload a PDF/DOCX file → Extract → Clean → Summarize → Simplify → Link laws.
    Automatically detects or uses provided language (English, Hindi, Tamil, Kannada).
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_{file.filename}")

    try:
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        logger.info(f"Uploaded file saved to: {temp_path}")

        text = get_text(temp_path)
        if not text.strip():
            raise HTTPException(status_code=400, detail="No readable text found in file")

        # 🔍 Auto Language Detection (if not manually provided)
        if not lang:
            if any("\u0900" <= ch <= "\u097F" for ch in text):
                lang = "hi_IN"
            elif any("\u0B80" <= ch <= "\u0BFF" for ch in text):
                lang = "ta_IN"
            elif any("\u0C80" <= ch <= "\u0CFF" for ch in text):
                lang = "kn_IN"
            else:
                lang = "en_XX"
        logger.info(f"Detected/selected language: {lang}")

        cleaned = clean_text(text)
        processed = preprocess_for_ai(cleaned)
        articles = extract_articles(processed)

        # 🤖 AI Summarization and Simplification
        summary = summarize_text(processed, output_lang=lang)
        simplified = simplify_text(processed, output_lang=lang)
        law_info = get_law_info(articles if articles else [summary])

        # 💾 Save query record
        try:
            db = SessionLocal()
            rec = UserQuery(input_text=text, summary=summary, simplified=simplified)
            db.add(rec)
            db.commit()
        except Exception as e:
            logger.error(f"Database logging failed: {e}")
        finally:
            db.close()

        return {
            "detected_language": lang,
            "articles_found": articles,
            "summary": summary,
            "simplified": simplified,
            "law_details": law_info,
        }

    except Exception as e:
        logger.exception("Error processing file")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Temp file cleanup failed: {e}")


# ==========================================================
# ✏️ Process Text (Auto-Language)
# ==========================================================
@app.post("/process-text")
async def process_text(data: dict = Body(...)):
    """
    Accept plain text input → Auto detect language → Preprocess → Summarize → Simplify → Link laws.
    """
    text = data.get("text", "").strip()
    requested_lang = data.get("lang")  # Optional manual override

    if not text:
        raise HTTPException(status_code=400, detail="No text provided")

    # 🔍 Auto Language Detection
    if not requested_lang:
        if any("\u0900" <= ch <= "\u097F" for ch in text):
            requested_lang = "hi_IN"
        elif any("\u0B80" <= ch <= "\u0BFF" for ch in text):
            requested_lang = "ta_IN"
        elif any("\u0C80" <= ch <= "\u0CFF" for ch in text):
            requested_lang = "kn_IN"
        else:
            requested_lang = "en_XX"

    logger.info(f"Detected/selected language: {requested_lang}")

    try:
        cleaned = clean_text(text)
        processed = preprocess_for_ai(cleaned)
        articles = extract_articles(processed)

        summary = summarize_text(processed, output_lang=requested_lang)
        simplified = simplify_text(processed, output_lang=requested_lang)
        law_info = get_law_info(articles if articles else [summary])

        db = SessionLocal()
        rec = UserQuery(input_text=text, summary=summary, simplified=simplified)
        db.add(rec)
        db.commit()
        db.close()

        return {
            "detected_language": requested_lang,
            "articles_found": articles,
            "summary": summary,
            "simplified": simplified,
            "law_details": law_info,
        }

    except Exception as e:
        logger.exception("Error processing text")
        raise HTTPException(status_code=500, detail=f"Error: {e}")


# ==========================================================
# 🧠 Fine-Tuning Endpoint (Async)
# ==========================================================
@app.post("/train-json")
async def train_json(
    file: UploadFile = File(None),
    background_tasks: BackgroundTasks = None
):
    """
    Upload or use internal dataset to fine-tune BART/mBART models.
    Executes asynchronously to prevent blocking.
    """
    dataset_path = None
    if file:
        dataset_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_{file.filename}")
        with open(dataset_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        logger.info(f"Dataset uploaded to: {dataset_path}")

    db = SessionLocal()
    job = TrainJob(filename=os.path.basename(dataset_path or "internal_dataset"), status="queued")
    db.add(job)
    db.commit()
    db.refresh(job)
    job_id = job.id
    db.close()

    # Run in background
    def _run_train(path, job_id):
        db = SessionLocal()
        job = db.query(TrainJob).filter(TrainJob.id == job_id).first()
        try:
            job.status = "running"
            db.commit()
            model_path = train_custom_bart_json(path)
            job.status = "done"
            job.detail = f"✅ Model saved at: {model_path}"
            db.commit()
        except Exception as e:
            job.status = "failed"
            job.detail = str(e)
            db.commit()
            logger.error(f"Fine-tuning failed: {e}")
        finally:
            db.close()

    if background_tasks:
        background_tasks.add_task(_run_train, dataset_path, job_id)
        logger.info(f"Fine-tuning job started (Job ID: {job_id})")

    return {"status": "started", "job_id": job_id}


# NOTE: The simple/dev `/login` was removed to avoid duplicate route definitions.
# Use the registered /register and /login endpoints defined further below which
# include DB-backed users and proper token creation.


# ==========================================================
# 🔍 Fine-Tuning Job Status
# ==========================================================
@app.get("/train-status/{job_id}")
def train_status(job_id: int):
    """Check fine-tuning progress."""
    db = SessionLocal()
    job = db.query(TrainJob).filter(TrainJob.id == job_id).first()
    db.close()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "status": job.status,
        "detail": job.detail,
        "created_at": str(job.created_at),
        "finished_at": str(job.finished_at) if job.finished_at else None,
    }


# ==========================================================
# ⚙️ Admin: Model Management
# ==========================================================
@app.get("/admin/models")
def list_models():
    """List available fine-tuned models."""
    db = SessionLocal()
    rows = db.query(ModelVersion).order_by(ModelVersion.created_at.desc()).all()
    db.close()
    return [
        {
            "id": r.id,
            "name": r.version_name,
            "path": r.path,
            "active": r.active,
            "dataset": r.dataset,
        }
        for r in rows
    ]


@app.post("/admin/models/activate/{model_id}")
def activate_model(model_id: int):
    """Activate a model and reload summarizer."""
    db = SessionLocal()
    target = db.query(ModelVersion).filter(ModelVersion.id == model_id).first()
    if not target:
        db.close()
        raise HTTPException(status_code=404, detail="Model not found")

    db.query(ModelVersion).update({ModelVersion.active: False})
    target.active = True
    db.commit()
    db.close()

    reload_summarizer(target.path)
    logger.info(f"Activated model: {target.version_name}")
    return {"status": "activated", "model": target.version_name}


# ==========================================================
# ⚖️ Admin: Law Management
# ==========================================================
@app.post("/admin/laws/add")
def add_law(law_ref: str, description: str):
    """Add new law entries to DB."""
    db = SessionLocal()
    exists = db.query(Law).filter(Law.law_ref == law_ref).first()
    if exists:
        db.close()
        raise HTTPException(status_code=400, detail="Law already exists")

    law = Law(law_ref=law_ref, description=description)
    db.add(law)
    db.commit()
    db.close()
    return {"status": "added"}


@app.delete("/admin/laws/{law_ref}")
def delete_law(law_ref: str):
    """Delete law by reference (admin panel helper)."""
    db = SessionLocal()
    target = db.query(Law).filter(Law.law_ref == law_ref).first()
    if not target:
        db.close()
        raise HTTPException(status_code=404, detail="Law not found")
    db.delete(target)
    db.commit()
    db.close()
    return {"status": "deleted", "law_ref": law_ref}


@app.get("/admin/laws")
def list_laws():
    """Fetch all stored laws."""
    db = SessionLocal()
    rows = db.query(Law).all()
    db.close()
    return [{"law_ref": r.law_ref, "description": r.description} for r in rows]

# Note: the delete endpoint for laws was defined earlier; duplicate route removed to avoid
# FastAPI "duplicate route" errors. The canonical delete handler is defined above.


# ==========================================================
# 📚 User Queries API (frontend ↔ backend single-DB access)
# ==========================================================
@app.get("/queries")
def list_queries(limit: int = 20, offset: int = 0):
    """List recent user queries. Frontend can use this to show history.

    - limit: maximum rows to return
    - offset: pagination offset
    """
    db = SessionLocal()
    try:
        rows = (
            db.query(UserQuery)
            .order_by(UserQuery.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )
        result = []
        for r in rows:
            result.append({
                "id": r.id,
                "input_text": r.input_text,
                "summary": r.summary,
                "simplified": r.simplified,
                "file_name": r.file_name,
                "created_at": str(r.created_at),
            })
        return result
    finally:
        db.close()


@app.get("/queries/{query_id}")
def get_query(query_id: int):
    """Return a single saved query by id."""
    db = SessionLocal()
    try:
        r = db.query(UserQuery).filter(UserQuery.id == query_id).first()
        if not r:
            raise HTTPException(status_code=404, detail="Query not found")
        return {
            "id": r.id,
            "input_text": r.input_text,
            "summary": r.summary,
            "simplified": r.simplified,
            "articles_found": r.articles_found,
            "law_details": r.law_details,
            "file_name": r.file_name,
            "created_at": str(r.created_at),
        }
    finally:
        db.close()


@app.delete("/queries/{query_id}")
def delete_query(query_id: int):
    """Delete a saved query (admin or developer use)."""
    db = SessionLocal()
    try:
        r = db.query(UserQuery).filter(UserQuery.id == query_id).first()
        if not r:
            raise HTTPException(status_code=404, detail="Query not found")
        db.delete(r)
        db.commit()
        return {"status": "deleted", "id": query_id}
    finally:
        db.close()


# data import start 
import pandas as pd
from fastapi import UploadFile, File

@app.post("/admin/import-laws")
async def import_laws(file: UploadFile = File(...)):
    """Import laws from an uploaded CSV file (admin use only)."""
    contents = await file.read()
    df = pd.read_csv(pd.io.common.BytesIO(contents))

    db = SessionLocal()
    inserted, skipped = 0, 0
    for _, row in df.iterrows():
        law_ref = str(row.get("law_ref")).strip()
        desc = str(row.get("description", "")).strip()
        if not law_ref or not desc:
            continue

        exists = db.query(Law).filter(Law.law_ref == law_ref).first()
        if exists:
            skipped += 1
            continue

        db.add(Law(law_ref=law_ref, description=desc))
        inserted += 1

    db.commit()
    db.close()

    return {"status": "✅ Import completed", "inserted": inserted, "skipped": skipped}


#frontend points
# Add these endpoints to your existing app.py

# ==========================================================
# 🔐 Authentication Endpoints
# ==========================================================
@app.post("/register")
async def register(
    username: str,
    email: str,
    password: str,
    full_name: str = None,
    db: Session = Depends(get_db)
):
    """User registration endpoint."""
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username or email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(password)
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_active=True,
            is_admin=False
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token = create_access_token(data={"sub": user.username})
        
        return {
            "message": "User created successfully",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_admin": user.is_admin
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/login")
async def login(
    username: str,
    password: str,
    db: Session = Depends(get_db)
):
    """User login endpoint."""
    try:
        user = authenticate_user(db, username, password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Create access token
        access_token = create_access_token(data={"sub": user.username})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name,
                "is_admin": user.is_admin
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@app.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if token is valid."""
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "is_admin": current_user.is_admin
        }
    }


@app.get("/user/profile")
def user_profile(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_admin": current_user.is_admin,
    }


@app.get("/user/queries")
def user_queries(skip: int = 0, limit: int = 50, current_user: User = Depends(get_current_user)):
    """List queries for the authenticated user. Frontend uses `skip`/`limit`.

    Maps `skip` to SQL offset.
    """
    db = SessionLocal()
    try:
        rows = (
            db.query(UserQuery)
            .filter(UserQuery.user_id == current_user.id)
            .order_by(UserQuery.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return [
            {
                "id": r.id,
                "input_text": r.input_text,
                "summary": r.summary,
                "simplified": r.simplified,
                "file_name": r.file_name,
                "created_at": str(r.created_at),
            }
            for r in rows
        ]
    finally:
        db.close()


@app.post("/user/feedback")
def submit_feedback(payload: dict = Body(...), current_user: User = Depends(get_current_user)):
    """Accept feedback for a query. Expected payload keys:
    - query_id (int)
    - rating (int)
    - feedback_text (str)
    - helpful_summary (bool)
    - helpful_simplification (bool)
    - accuracy_rating (int)
    """
    db = SessionLocal()
    try:
        query_id = payload.get("query_id")
        if not query_id:
            raise HTTPException(status_code=400, detail="Missing query_id")

        # Ensure the query exists and belongs to the user (or allow admin)
        q = db.query(UserQuery).filter(UserQuery.id == query_id).first()
        if not q:
            raise HTTPException(status_code=404, detail="Query not found")
        if q.user_id and q.user_id != current_user.id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not allowed to submit feedback for this query")

        fb = UserFeedback(
            query_id=query_id,
            rating=payload.get("rating"),
            feedback_text=payload.get("feedback_text"),
            helpful_summary=payload.get("helpful_summary"),
            helpful_simplification=payload.get("helpful_simplification"),
            accuracy_rating=payload.get("accuracy_rating"),
        )
        db.add(fb)
        db.commit()
        db.refresh(fb)
        return {"status": "ok", "id": fb.id}
    finally:
        db.close()