import pandas as pd
from difflib import get_close_matches
from sentence_transformers import SentenceTransformer, util
import torch
import os

# ---------------------------
# ✅ Model Setup
# ---------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"⚙️ Using device: {device.upper()}")

# Load a lightweight transformer for semantic similarity (fast + accurate)
model = SentenceTransformer("all-MiniLM-L6-v2", device=device)


# ---------------------------
# ✅ Load Indian Law Dataset
# ---------------------------
def load_law_database(csv_path: str = "backend/laws_dataset.csv"):
    """
    Load Indian law references from CSV.
    Expected columns: 'law_ref', 'description'
    - Case-insensitive keys
    - Trims spaces
    """
    try:
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"{csv_path} not found.")

        df = pd.read_csv(csv_path)

        if "law_ref" not in df.columns or "description" not in df.columns:
            raise ValueError("CSV must contain columns: 'law_ref' and 'description'")

        # Normalize text for consistency
        df["law_ref"] = df["law_ref"].astype(str).str.strip().str.lower()
        df["description"] = df["description"].astype(str).str.strip()

        print(f"✅ Loaded {len(df)} law records from {csv_path}")
        return dict(zip(df["law_ref"], df["description"]))

    except Exception as e:
        print(f"⚠️ Error loading law dataset: {e}")
        return {}


# ---------------------------
# ✅ Initialize Dataset
# ---------------------------
LAW_DB = load_law_database()

# ---------------------------
# ✅ Precompute Embeddings
# ---------------------------
if LAW_DB:
    law_texts = [f"{k} {v}" for k, v in LAW_DB.items()]
    law_embeds = model.encode(law_texts, convert_to_tensor=True, show_progress_bar=True)
    print(f"✅ Created {len(LAW_DB)} semantic embeddings.")
else:
    law_embeds = torch.tensor([], dtype=torch.float32)
    print("⚠️ No laws loaded. Semantic search disabled.")


# ---------------------------
# ✅ Semantic Matching
# ---------------------------
def semantic_match(query: str):
    """
    Find semantically closest law reference to a query.
    Uses cosine similarity on precomputed embeddings.
    Returns: (best_match, similarity_score)
    """
    if not law_embeds.numel():
        return None, 0.0

    query_emb = model.encode(query.lower(), convert_to_tensor=True)
    sims = util.cos_sim(query_emb, law_embeds)[0]
    idx = torch.argmax(sims).item()
    score = sims[idx].item()

    key = list(LAW_DB.keys())[idx]
    return key, score


# ---------------------------
# ✅ Main Function — Get Law Info
# ---------------------------
def get_law_info(refs):
    """
    Multi-level matching for each law reference:
    1️⃣ Exact match (case-insensitive)
    2️⃣ Fuzzy match (string similarity)
    3️⃣ Semantic match (SentenceTransformer)
    Returns dict:
        {
          "Article 21": {"description": "...", "match_type": "semantic (article 21, 0.83)"}
        }
    """
    info = {}

    for ref in refs:
        if not ref or not isinstance(ref, str):
            continue

        r_clean = ref.strip().lower()

        # 1️⃣ Exact match
        if r_clean in LAW_DB:
            info[ref] = {
                "description": LAW_DB[r_clean],
                "match_type": "exact"
            }
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


# ---------------------------
# ✅ RAG Helper — Context Builder
# ---------------------------
def get_context_text(refs, top_k: int = 3) -> str:
    """
    Retrieve top law descriptions to build RAG context.
    Used by summarize_with_rag() in module3_ai.py.
    Example output:
        "Relevant Legal Context:
         Article 21: Protection of life and liberty.
         Section 302: Punishment for murder."
    """
    if not refs:
        return ""

    info = get_law_info(refs)
    descriptions = [
        v["description"]
        for v in info.values()
        if v["description"] != "No description available."
    ]

    if not descriptions:
        return ""

    context = " ".join(descriptions[:top_k])
    return f"\nRelevant Legal Context:\n{context}"
