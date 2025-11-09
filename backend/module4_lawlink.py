# backend/module4_lawlink.py
import pandas as pd
import os
from difflib import get_close_matches
# `sentence_transformers` and `torch` are heavy libraries — import them lazily
# inside `ensure_laws_loaded()` to avoid import-time failures and slow startup.
from .config import EMBEDDING_MODEL

# Load law DB from SQL at startup if available — but also allow CSV
from .database import SessionLocal, Law
import logging

logger = logging.getLogger(__name__)

def load_laws():
    """Load laws from DB or CSV, with fallback behavior and logging."""
    try:
        db = SessionLocal()
        rows = db.query(Law).all()
        db.close()
        law_map = {}
        for r in rows:
            law_map[r.law_ref.strip().lower()] = r.description
        if law_map:
            logger.info("Loaded %d laws from database", len(law_map))
            return law_map
    except Exception as e:
        logger.warning("Could not load laws from database: %s", e)
    
    # Fallback: try CSV in backend/data/
    try:
        csv_path = os.path.join(os.path.dirname(__file__), "data", "laws_dataset.csv")
        if os.path.exists(csv_path):
            df = pd.read_csv(csv_path)
            df["law_ref"] = df["law_ref"].astype(str).str.strip().str.lower()
            df["description"] = df["description"].astype(str).str.strip()
            law_map = dict(zip(df["law_ref"], df["description"]))
            if law_map:
                logger.info("Loaded %d laws from CSV", len(law_map))
                return law_map
    except Exception as e:
        logger.warning("Could not load laws from CSV: %s", e)
    
    logger.warning("No laws loaded from any source")
    return {}

# Initialize these as None, they'll be populated on first use
LAW_DB = None
model = None
law_embeds = None
law_texts = []


def ensure_laws_loaded():
    """Ensure laws and embeddings are loaded before use."""
    global LAW_DB, model, law_embeds, law_texts
    if LAW_DB is None:
        LAW_DB = load_laws()

    # initialize semantic model if we have laws and embeddings not yet created
    if LAW_DB and (law_embeds is None):
        try:
            # lazy imports of heavy libraries
            from sentence_transformers import SentenceTransformer, util as _st_util
            import torch as _torch

            # keep module-level references to used objects
            # Note: we only keep `model` and `law_embeds` at module scope; util/torch used locally in semantic_match
            model = SentenceTransformer(EMBEDDING_MODEL, device="cpu")
            law_texts = [f"{k} {v}" for k, v in LAW_DB.items()]
            law_embeds = model.encode(law_texts, convert_to_tensor=True, show_progress_bar=False)
            # store util and torch objects on the module so semantic_match can access them
            globals()['_st_util'] = _st_util
            globals()['_torch'] = _torch
            logger.info("Initialized law embeddings for %d laws", len(law_texts))
        except Exception as e:
            logger.warning("Failed to initialize law embedding model: %s", e)
            model = None
            law_embeds = None

def semantic_match(query: str):
    # only attempt semantic match if embeddings and model are initialized
    if law_embeds is not None and getattr(law_embeds, 'numel', lambda: 0)():
        _st_util = globals().get('_st_util')
        _torch = globals().get('_torch')
        if model is None or _st_util is None or _torch is None:
            return None, 0.0
        q_emb = model.encode(query, convert_to_tensor=True)
        sims = _st_util.cos_sim(q_emb, law_embeds)[0]
        idx = _torch.argmax(sims).item()
        score = sims[idx].item()
        key = list(LAW_DB.keys())[idx]
        return key, score
    return None, 0.0

def get_context_text(refs, top_k: int = 3):
    """Get context text for a list of legal references.
    
    Args:
        refs: List of legal references to look up
        top_k: Maximum number of descriptions to include
    
    Returns:
        str: Formatted context text or empty string
    """
    ensure_laws_loaded()
    info = get_law_info(refs)
    descriptions = [v["description"] for v in info.values() if v["description"] and v["description"] != "No description available."]
    context = " ".join(descriptions[:top_k])
    return f"\nRelevant Legal Context:\n{context}" if context else ""

def get_law_info(refs):
    """Get detailed information about legal references.
    
    Args:
        refs: List of legal references to look up
    
    Returns:
        dict: Information about each reference including description and match type
    """
    ensure_laws_loaded()
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
