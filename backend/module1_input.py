# backend/module1_input.py

"""File extraction helpers with optional dependencies.

This module tries to import heavy optional libraries (PyMuPDF, python-docx,
Pillow, pytesseract). If they are unavailable the functions will still be
importable but will fall back to safe behaviour (return empty string or
read plain text files). This prevents import-time failures in environments
where OCR / document libs are not installed (CI, lightweight dev).
"""

import os
import logging

logger = logging.getLogger(__name__)

# Try optional imports; if missing, log a warning and provide fallbacks.
try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None
    logger.debug("PyMuPDF not available; PDF extraction disabled")

try:
    from docx import Document
except Exception:
    Document = None
    logger.debug("python-docx not available; DOCX extraction disabled")

try:
    from PIL import Image
except Exception:
    Image = None
    logger.debug("Pillow not available; image extraction disabled")

try:
    import pytesseract
except Exception:
    pytesseract = None
    logger.debug("pytesseract not available; OCR disabled")


def extract_from_pdf(pdf_path: str) -> str:
    if fitz is None:
        return ""
    text = ""
    try:
        doc = fitz.open(pdf_path)
        for page in doc:
            text += page.get_text("text")
    except Exception as e:
        logger.warning("PDF extraction failed (%s): %s", pdf_path, e)
    return text


def extract_from_docx(docx_path: str) -> str:
    if Document is None:
        return ""
    try:
        doc = Document(docx_path)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        logger.warning("DOCX extraction failed (%s): %s", docx_path, e)
        return ""


def extract_from_image(image_path: str) -> str:
    if Image is None or pytesseract is None:
        return ""
    try:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img)
    except Exception as e:
        logger.warning("Image extraction failed (%s): %s", image_path, e)
        return ""


def get_text(file_path: str) -> str:
    """Return extracted text from supported file types.

    Falls back to reading plain text files for unknown formats. If optional
    libraries are missing extraction returns an empty string for that type.
    """
    if not os.path.exists(file_path):
        return ""

    file_path = str(file_path)

    if file_path.lower().endswith(".pdf"):
        return extract_from_pdf(file_path)
    elif file_path.lower().endswith((".docx", ".doc")):
        return extract_from_docx(file_path)
    elif file_path.lower().endswith((".png", ".jpg", ".jpeg")):
        return extract_from_image(file_path)
    else:
        # accept plain text files too
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception:
            return ""