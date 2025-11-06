# backend/faiss_index.py
import faiss
import numpy as np
from module4_lawlink import LAW_DB, model

def build_index():
    texts = [f"{k} {v['description']}" for k, v in LAW_DB.items()]
    embeddings = model.encode(texts, convert_to_numpy=True)
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(np.array(embeddings).astype('float32'))
    keys = list(LAW_DB.keys())
    return index, keys

# usage example:
# idx, keys = build_index()
# D, I = idx.search(query_emb, k=3)
