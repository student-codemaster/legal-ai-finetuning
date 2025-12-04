# backend/module2_processing.py

import re
import unicodedata
import logging

logger = logging.getLogger(__name__)

# Optional heavy NLP imports guarded to avoid import-time failures
try:
    import spacy
except Exception:
    spacy = None

# Try to get NLTK stopwords, but fall back to an empty set if unavailable
try:
    from nltk.corpus import stopwords
    try:
        STOPWORDS = set(stopwords.words("english"))
    except Exception:
        STOPWORDS = set()
except Exception:
    STOPWORDS = set()

# Load English NLP model (optional)
try:
    nlp = spacy.load("en_core_web_sm") if spacy else None
except Exception:
    nlp = None  # fallback if spacy model not available

def clean_text(text: str) -> str:
    """
    Clean raw text for downstream processing.
    - Normalize unicode
    - Collapse whitespace
    - Remove common bracketed citations and noisy tokens
    """
    if not text:
        return ""
    
    # Normalize unicode
    text = unicodedata.normalize("NFKC", text)
    
    # Remove multiple spaces and newlines
    text = re.sub(r'\s+', ' ', text)
    
    # Remove citations like [1], (2), AIR 1980 SC 1234, etc.
    text = re.sub(r'\[[^\]]+\]|\([^)]+\)|AIR\s\d{4}\s[A-Z]{2,}\s\d+', '', text)
    
    # Preserve key legal terms like "Article", "Section" by not removing nearby numbers
    text = re.sub(r'(?<!Article\s)(?<!Section\s)\b\d+\b', '', text)
    
    # Remove special characters (keep basic punctuation)
    text = re.sub(r'[^a-zA-Z0-9\s\.,:;!?\-\"]', '', text)
    
    return text.strip()

def preprocess_for_ai(text: str) -> str:
    """
    Perform light preprocessing: tokenization, stopword removal, and optional
    lemmatization when spaCy is available.
    """
    text = clean_text(text)
    
    if not nlp:
        tokens = [t for t in text.split() if t.lower() not in STOPWORDS]
        return " ".join(tokens)
    
    doc = nlp(text)
    processed_tokens = []
    
    for token in doc:
        if token.is_stop or token.is_punct:
            continue
        processed_tokens.append(token.lemma_.lower())
    
    return " ".join(processed_tokens)

def extract_articles(text: str):
    """  
    Extract 'Article' or 'Section' references for law linking.
    """  
    return re.findall(r'(Article\s\d+[A-Z]?|Section\s\d+[A-Z]?)', text)