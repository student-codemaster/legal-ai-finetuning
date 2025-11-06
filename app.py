# backend/app.py
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import os, shutil, uuid
from module1_input import get_text
from module2_processing import clean_text, extract_articles
from module3_ai import summarize_text, simplify_text, train_custom_bart_json, reload_summarizer
from module4_lawlink import get_law_info, get_context_text
from database import SessionLocal, UserQuery, Law, ModelVersion, TrainJob
from config import UPLOAD_DIR
from module3_ai import summarize_text, simplify_text, train_custom_bart_json, reload_summarizer


app = FastAPI(title="AI Legal Simplifier – Production")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_DIR, exist_ok=True)

# simple home
@app.get("/")
def home():
    return {"status": "AI Legal Simplifier backend running"}

# process file
@app.post("/process")
async def process_file(file: UploadFile = File(...)):
    temp_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_{file.filename}")
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    text = get_text(temp_path)
    text = clean_text(text)
    articles = extract_articles(text)
    summary = summarize_text(text)
    simplified = simplify_text(text)
    law_info = get_law_info(articles if articles else [summary])

    # save query
    db = SessionLocal()
    rec = UserQuery(input_text=text, summary=summary, simplified=simplified)
    db.add(rec); db.commit(); db.close()

    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info
    }

# process text
@app.post("/process-text")
async def process_text(data: dict = Body(...)):
    text = data.get("text", "")
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text provided")
    cleaned = clean_text(text)
    articles = extract_articles(cleaned)
    summary = summarize_text(cleaned)
    simplified = simplify_text(cleaned)
    law_info = get_law_info(articles if articles else [summary])

    db = SessionLocal()
    rec = UserQuery(input_text=text, summary=summary, simplified=simplified)
    db.add(rec); db.commit(); db.close()

    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info
    }

# Background train job (non-blocking)
from pathlib import Path
@app.post("/train-json")
async def train_json_endpoint(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    # Save file
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    dataset_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}_{file.filename}")
    with open(dataset_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Create job row
    db = SessionLocal()
    job = TrainJob(filename=os.path.basename(dataset_path), status="queued")
    db.add(job); db.commit(); db.refresh(job)
    job_id = job.id
    db.close()

    # Run training in background
    def _run_train(path, job_id):
        db = SessionLocal()
        job = db.query(TrainJob).filter(TrainJob.id == job_id).first()
        try:
            job.status = "running"; db.commit()
            model_path = train_custom_bart_json(path)  # blocking call
            job.status = "done"; job.detail = f"Saved: {model_path}"; db.commit()
        except Exception as e:
            job.status = "failed"; job.detail = str(e); db.commit()
        finally:
            db.close()
    if background_tasks is not None:
        background_tasks.add_task(_run_train, dataset_path, job_id)

    return {"status": "started", "job_id": job_id}

@app.get("/train-status/{job_id}")
def train_status(job_id: int):
    db = SessionLocal()
    job = db.query(TrainJob).filter(TrainJob.id == job_id).first()
    db.close()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"id": job.id, "status": job.status, "detail": job.detail, "created_at": str(job.created_at), "finished_at": str(job.finished_at) if job.finished_at else None}

# Admin endpoints: models and laws
@app.get("/admin/models")
def list_models():
    db = SessionLocal()
    rows = db.query(ModelVersion).order_by(ModelVersion.created_at.desc()).all()
    db.close()
    return [{"id": r.id, "name": r.version_name, "path": r.path, "active": r.active, "dataset": r.dataset} for r in rows]

@app.post("/admin/models/activate/{model_id}")
def activate_model(model_id: int):
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
    return {"status": "activated", "model": target.version_name}

@app.post("/admin/laws/add")
def add_law(law_ref: str, description: str):
    db = SessionLocal()
    exists = db.query(Law).filter(Law.law_ref == law_ref).first()
    if exists:
        db.close()
        raise HTTPException(status_code=400, detail="Law already exists")
    law = Law(law_ref=law_ref, description=description)
    db.add(law); db.commit(); db.close()
    return {"status":"added"}

@app.get("/admin/laws")
def list_laws():
    db = SessionLocal()
    rows = db.query(Law).all()
    db.close()
    return [{"law_ref": r.law_ref, "description": r.description} for r in rows]
