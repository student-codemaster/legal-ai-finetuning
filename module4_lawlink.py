# backend/module4_lawlink.py
import pandas as pd
import os
from difflib import get_close_matches
from sentence_transformers import SentenceTransformer, util
import torch
from .config import EMBEDDING_MODEL

# Load law DB from SQL at startup if available — but also allow CSV
from .database import SessionLocal, Law

def load_laws_from_db():
    db = SessionLocal()
    rows = db.query(Law).all()
    db.close()
    law_map = {}
    for r in rows:
        law_map[r.law_ref.strip().lower()] = r.description
    return law_map

LAW_DB = load_laws_from_db()

# Fallback: try CSV in data/
if not LAW_DB:
    csv_path = "data/laws_dataset.csv"
    if os.path.exists(csv_path):
        df = pd.read_csv(csv_path)
        df["law_ref"] = df["law_ref"].astype(str).str.strip().str.lower()
        df["description"] = df["description"].astype(str).str.strip()
        LAW_DB = dict(zip(df["law_ref"], df["description"]))

# semantic model
model = None
law_embeds = None
law_texts = []

if LAW_DB:
    try:
        model = SentenceTransformer(EMBEDDING_MODEL, device="cpu")
        law_texts = [f"{k} {v}" for k, v in LAW_DB.items()]
        law_embeds = model.encode(law_texts, convert_to_tensor=True, show_progress_bar=False)
    except Exception as e:
        # if embedding model fails, proceed with fuzzy only
        model = None
        law_embeds = None

def semantic_match(query: str):
    if not law_embeds is None and law_embeds.numel():
        q_emb = model.encode(query, convert_to_tensor=True)
        sims = util.cos_sim(q_emb, law_embeds)[0]
        idx = torch.argmax(sims).item()
        score = sims[idx].item()
        key = list(LAW_DB.keys())[idx]
        return key, score
    return None, 0.0

def get_context_text(refs, top_k: int = 3):
    info = get_law_info(refs)
    descriptions = [v["description"] for v in info.values() if v["description"] and v["description"] != "No description available."]
    context = " ".join(descriptions[:top_k])
    return f"\nRelevant Legal Context:\n{context}" if context else ""

def get_law_info(refs):
    info = {}
    if not refs:
        return info
    for r in refs:
        r_clean = str(r).strip().lower()
        if not r_clean:
            continue
        if r_clean in LAW_DB:
            info[r] = {"description": LAW_DB[r_clean], "match_type": "exact"}
            continue
        close = get_close_matches(r_clean, LAW_DB.keys(), n=1, cutoff=0.7)
        if close:
            m = close[0]
            info[r] = {"description": LAW_DB[m], "match_type": f"fuzzy ({m})"}
            continue
        m, s = semantic_match(r_clean)
        if m and s > 0.45:
            info[r] = {"description": LAW_DB[m], "match_type": f"semantic ({m}, score={s:.2f})"}
        else:
            info[r] = {"description": "No description available.", "match_type": "none"}
    return info
