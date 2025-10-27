import re

def clean_text(text):
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_articles(text):
    patterns = [
        r'Article\\s+\\d+[A-Za-z0-9-]*',
        r'Section\\s+\\d+[A-Za-z0-9()-]*',
        r'Clause\\s+\\(?[0-9A-Za-z)\\-]+'
    ]
    matches = []
    for pattern in patterns:
        matches += re.findall(pattern, text, re.IGNORECASE)
    return list(set(matches))
