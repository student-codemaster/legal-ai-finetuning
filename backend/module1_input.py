# backend/module1_input.py
import fitz  # PyMuPDF
from docx import Document
from PIL import Image
import pytesseract
import os

def extract_from_pdf(pdf_path):
    text = ""
    doc = fitz.open(pdf_path)
    for page in doc:
        text += page.get_text("text")
    return text

def extract_from_docx(docx_path):
    doc = Document(docx_path)
    return "\n".join(p.text for p in doc.paragraphs)

def extract_from_image(image_path):
    img = Image.open(image_path)
    return pytesseract.image_to_string(img)

def get_text(file_path):
    # keep signature the same
    if not os.path.exists(file_path):
        return ""
    file_path = str(file_path)
    if file_path.endswith(".pdf"):
        return extract_from_pdf(file_path)
    elif file_path.endswith(".docx") or file_path.endswith(".doc"):
        return extract_from_docx(file_path)
    elif file_path.endswith((".png", ".jpg", ".jpeg")):
        return extract_from_image(file_path)
    else:
        # accept plain text files too
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return "Unsupported format"
