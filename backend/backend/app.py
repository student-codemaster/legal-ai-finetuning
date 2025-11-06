from fastapi import FastAPI, UploadFile, File, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import os, shutil

# ----- Module Imports -----
from backend.module1_input import get_text
from backend.module2_processing import clean_text, extract_articles
from backend.module3_ai import summarize_text, simplify_text
from backend.module4_lawlink import get_law_info

# ----- Database -----
from backend.database import SessionLocal, UserQuery, Law

# =====================================================
# ⚙️ APP SETUP
# =====================================================
app = FastAPI(title="AI Legal Simplifier – Smart Legal Text Summarizer")

# ----- Enable CORS for frontend -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================================================
# 📄 PROCESS FILE UPLOAD
# =====================================================
@app.post("/process")
async def process_file(file: UploadFile = File(...)):
    """Extracts, cleans, summarizes & simplifies uploaded DOCX/PDF."""
    temp_path = file.filename
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    # Process content
    text = get_text(temp_path)
    text = clean_text(text)
    articles = extract_articles(text)
    summary = summarize_text(text)
    simplified = simplify_text(text)
    law_info = get_law_info(articles if articles else [summary])

    # Save query to DB
    save_query(text, summary, simplified)

    # Return JSON response
    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info,
    }

# =====================================================
# 📝 PROCESS TEXT INPUT (Manual Entry)
# =====================================================
@app.post("/process-text")
async def process_text(data: dict = Body(...)):
    """Processes manually entered legal text."""
    text = data.get("text", "")
    if not text.strip():
        return {"error": "No text provided"}

    cleaned = clean_text(text)
    articles = extract_articles(cleaned)
    summary = summarize_text(cleaned)
    simplified = simplify_text(cleaned)
    law_info = get_law_info(articles if articles else [summary])

    save_query(text, summary, simplified)

    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info,
    }

# =====================================================
# 🗄️ DATABASE OPERATIONS
# =====================================================
def save_query(input_text, summary, simplified):
    """Store user query result in the database."""
    db = SessionLocal()
    rec = UserQuery(input_text=input_text, summary=summary, simplified=simplified)
    db.add(rec)
    db.commit()
    db.close()

@app.post("/laws")
def add_law(law_ref: str, description: str):
    """Add a new law to the database."""
    db = SessionLocal()
    exists = db.query(Law).filter(Law.law_ref == law_ref).first()
    if exists:
        db.close()
        raise HTTPException(status_code=400, detail="Law already exists")
    law = Law(law_ref=law_ref, description=description)
    db.add(law)
    db.commit()
    db.close()
    return {"status": "Law added successfully"}

@app.get("/laws")
def list_laws():
    """List all laws from the database."""
    db = SessionLocal()
    rows = db.query(Law).all()
    db.close()
    return [{"law_ref": r.law_ref, "description": r.description} for r in rows]

# =====================================================
# 🖥️ FRONTEND UI ROUTE
# =====================================================
from fastapi.responses import HTMLResponse
import os

@app.get("/", response_class=HTMLResponse)
def home():
    """Serve the main frontend page."""
    frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "frontend.html")
    try:
        with open(frontend_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return HTMLResponse("<h2>Frontend file not found. Please check your project structure.</h2>", status_code=404)

