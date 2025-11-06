# backend/module2_processing.py
import re

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_articles(text):
    # improved regex, returns normalized cases
    patterns = [
        r'\bArticle\s+\d+[A-Za-z0-9\-]*\b',
        r'\bSection\s+\d+[A-Za-z0-9\(\)\-]*\b',
        r'\bClause\s+\(?[0-9A-Za-z\)\-]+\b'
    ]
    matches = []
    for pattern in patterns:
        matches += re.findall(pattern, text, re.IGNORECASE)
    # normalize capitalization (Title case)
    normalized = []
    for m in set(matches):
        normalized.append(m.strip())
    return normalized
