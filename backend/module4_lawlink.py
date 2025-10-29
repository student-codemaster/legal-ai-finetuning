import pandas as pd
from difflib import get_close_matches
from sentence_transformers import SentenceTransformer, util
import torch
import os

# ---------------------------
# Model Setup (CPU safe)
# ---------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"⚙️ Using device: {device.upper()}")

# Load a lightweight sentence transformer for semantic similarity
model = SentenceTransformer("all-MiniLM-L6-v2", device=device)

# ---------------------------
# Load Indian Law Dataset
# ---------------------------
def load_law_database(csv_path: str = "backend/laws_dataset.csv"):
    """
    Load Indian law references from CSV.
    Expected columns: 'law_ref', 'description'
    Converts keys to lowercase for case-insensitive matching.
    """
    try:
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"{csv_path} not found.")
        df = pd.read_csv(csv_path)
        if "law_ref" not in df.columns or "description" not in df.columns:
            raise ValueError("CSV must contain columns: 'law_ref' and 'description'")

        df["law_ref"] = df["law_ref"].astype(str).str.strip().str.lower()
        df["description"] = df["description"].astype(str).str.strip()

        print(f"✅ Loaded {len(df)} laws from {csv_path}")
        return dict(zip(df["law_ref"], df["description"]))
    except Exception as e:
        print(f"⚠️ Error loading law dataset: {e}")
        return {}

LAW_DB = load_law_database()

# Precompute embeddings for semantic matching
if LAW_DB:
    law_texts = [f"{k} {v}" for k, v in LAW_DB.items()]
    law_embeds = model.encode(law_texts, convert_to_tensor=True)
    print(f"✅ Generated embeddings for {len(LAW_DB)} laws.")
else:
    law_embeds = torch.tensor([])

# ---------------------------
# Semantic Matching Function
# ---------------------------
def semantic_match(query: str):
    """Find the semantically closest law entry."""
    if not law_embeds.numel():
        return None, 0.0

    query_emb = model.encode(query.lower(), convert_to_tensor=True)
    sims = util.cos_sim(query_emb, law_embeds)[0]
    best_idx = torch.argmax(sims).item()
    best_score = sims[best_idx].item()

    key = list(LAW_DB.keys())[best_idx]
    return key, best_score

# ---------------------------
# Main Function: get_law_info
# ---------------------------
def get_law_info(refs):
    """
    Match law references using:
      1. Exact match (case-insensitive)
      2. Fuzzy match (approximate)
      3. Semantic similarity (AI-based)
    """
    info = {}

    for ref in refs:
        r_clean = ref.strip().lower()
        if not r_clean:
            continue

        # 1️⃣ Exact match
        if r_clean in LAW_DB:
            info[ref] = {"description": LAW_DB[r_clean], "match_type": "exact"}
            continue

        # 2️⃣ Fuzzy match
        close = get_close_matches(r_clean, LAW_DB.keys(), n=1, cutoff=0.7)
        if close:
            matched = close[0]
            info[ref] = {
                "description": LAW_DB[matched],
                "match_type": f"fuzzy ({matched})"
            }
            continue

        # 3️⃣ Semantic match
        matched, score = semantic_match(r_clean)
        if matched and score > 0.45:
            info[ref] = {
                "description": LAW_DB[matched],
                "match_type": f"semantic ({matched}, score={score:.2f})"
            }
        else:
            info[ref] = {
                "description": "No description available.",
                "match_type": "none"
            }

    return info
