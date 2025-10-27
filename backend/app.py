from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from module1_input import get_text
from module2_processing import clean_text, extract_articles
from module3_ai import summarize_text, simplify_text
from module4_lawlink import get_law_info

app = FastAPI()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/process")
async def process_file(file: UploadFile = File(...)):
    # Save file temporarily
    with open(file.filename, "wb") as f:
        f.write(await file.read())

    text = get_text(file.filename)
    text = clean_text(text)
    articles = extract_articles(text)
    summary = summarize_text(text)
    simplified = simplify_text(text)
    law_info = get_law_info(articles)

    return {
        "articles_found": articles,
        "summary": summary,
        "simplified": simplified,
        "law_details": law_info
    }
