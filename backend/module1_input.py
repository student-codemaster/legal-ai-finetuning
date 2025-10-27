import fitz  # PyMuPDF
from docx import Document
from PIL import Image
import pytesseract

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
    if file_path.endswith(".pdf"):
        return extract_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_from_docx(file_path)
    elif file_path.endswith((".png", ".jpg", ".jpeg")):
        return extract_from_image(file_path)
    else:
        return "Unsupported format"
