import re


def clean_text(text: str) -> str:
    """Remove unwanted whitespace and normalize spacing."""
    return re.sub(r"\s+", " ", text).strip()


def extract_articles(text: str):
    """
    Extract potential legal references like 'Article 21', 'Section 302'.
    """
    patterns = [
        r"Article\s+\d+[A-Za-z0-9-]*",
        r"Section\s+\d+[A-Za-z0-9()-]*",
        r"Clause\s+\(?[0-9A-Za-z)\-]+",
    ]
    matches = []
    for p in patterns:
        matches += re.findall(p, text, re.IGNORECASE)
    return list(set(matches))

