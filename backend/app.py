from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil

from backend.module1_input import get_text
from backend.module2_processing import clean_text, extract_articles
from backend.module3_ai import summarize_text, simplify_text, train_custom_bart_json, reload_summarizer
from backend.module4_lawlink import get_law_info



app = FastAPI(title="AI Legal Simplifier – JSON Fine-Tuning Ready")

# ----- Enable CORS for frontend -----
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----- Process a legal document -----
@app.post("/process")
async def process_file(file: UploadFile = File(...)):
    temp_path = file.filename
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    text = get_text(temp_path)
    text = clean_text(text)
    articles = extract_articles(text)
    summary = summarize_text(text)
    simplified = simplify_text(text)
    law_info = get_law_info(articles if articles else [summary])

    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info,
    }


# ----- Fine-tune from uploaded JSON -----
@app.post("/train-json")
async def train_json_dataset(file: UploadFile = File(...)):
    """
    Fine-tune BART model using uploaded JSON dataset.
    Expected keys per record:
      {"question": "...", "answer": "..."}  OR  {"text": "...", "summary": "..."}
    """
    os.makedirs("uploads", exist_ok=True)
    dataset_path = os.path.join("uploads", file.filename)

    with open(dataset_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    model_path = train_custom_bart_json(dataset_path)
    reload_summarizer(model_path)

    return {
        "status": "✅ Model fine-tuned successfully",
        "model_path": model_path,
    }


#Frontend
from fastapi.responses import HTMLResponse

@app.get("/", response_class=HTMLResponse)
def home():
    with open("frontend/frontend.html", "r", encoding="utf-8") as f:
        return f.read()
from fastapi import Body

@app.post("/process-text")
async def process_text(data: dict = Body(...)):
    """Process manually entered text."""
    text = data.get("text", "")
    if not text.strip():
        return {"error": "No text provided"}

    cleaned = clean_text(text)
    articles = extract_articles(cleaned)
    summary = summarize_text(cleaned)
    simplified = simplify_text(cleaned)
    law_info = get_law_info(articles if articles else [summary])

    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info,
    }
