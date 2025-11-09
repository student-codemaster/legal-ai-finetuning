import os
import json
import time
import logging
from typing import List, Dict, Optional, Tuple, Any

# Configure longer timeout for Hugging Face model downloads
os.environ["HF_HUB_DOWNLOAD_TIMEOUT"] = "500"  # 500 seconds
os.environ["HF_HUB_REQUEST_TIMEOUT"] = "60"   # 60 seconds for API requests

# Configure offline mode if models are cached locally
if os.getenv("USE_OFFLINE_MODELS"):
    os.environ["HF_DATASETS_OFFLINE"] = "1"
    os.environ["TRANSFORMERS_OFFLINE"] = "1"

logger = logging.getLogger(__name__)

try:
    import pandas as pd
except ImportError:
    pd = None

ML_AVAILABLE = True
try:
    import torch
    from transformers import (
        pipeline,
        BartForConditionalGeneration,
        BartTokenizer,
        MBartForConditionalGeneration,
        MBart50TokenizerFast,
        Trainer,
        TrainingArguments,
        DataCollatorForSeq2Seq,
    )
    from datasets import Dataset
except Exception:
    ML_AVAILABLE = False
    pipeline = BartForConditionalGeneration = BartTokenizer = MBartForConditionalGeneration = MBart50TokenizerFast = None
    Trainer = TrainingArguments = DataCollatorForSeq2Seq = Dataset = torch = None

from .config import MODEL_PATH, BART_MODEL_NAME, MBART_MODEL_NAME, BASE_MODEL_DIR, DEFAULT_TRAIN_EPOCHS
from .database import SessionLocal, ModelVersion, TrainJob
from .module2_processing import clean_text, extract_articles
# Avoid importing heavy lawlink utilities at module import time to reduce startup cost.
# If needed, callers can import `get_context_text` from module4_lawlink lazily.


# ============================================================
# 🔧 Defaults and Globals
# ============================================================
BART_BASE = os.getenv("BART_MODEL_NAME", "facebook/bart-large-cnn")
MBART_BASE = os.getenv("MBART_MODEL_NAME", "facebook/mbart-large-50-many-to-many-mmt")
ACTIVE_MODEL_PATH = os.getenv("ACTIVE_MODEL_PATH", MODEL_PATH or "backend/models/legal_bart_json")

SUMMARIZER = None
TRANSLATOR_TO_EN = None
TRANSLATOR_FROM_EN = None
DEFAULT_OUTPUT_LANG = os.getenv("DEFAULT_LANG", "en_XX")


# ============================================================
# 🧩 Initialization
# ============================================================
def _init_pipelines():
    """Load summarizer (BART) and translators (mBART)."""
    global SUMMARIZER, TRANSLATOR_TO_EN, TRANSLATOR_FROM_EN
    if not ML_AVAILABLE:
        SUMMARIZER = None
        return

    # Load fine-tuned model or fallback
    try:
        model_path = ACTIVE_MODEL_PATH if os.path.exists(ACTIVE_MODEL_PATH) else BART_BASE
        try:
            # Try loading from local cache first
            SUMMARIZER = pipeline("summarization", model=model_path, device=0 if torch.cuda.is_available() else -1, local_files_only=True)
            logger.info(f"Loaded model from local cache: {model_path}")
        except Exception as cache_err:
            logger.info(f"Model not in cache, downloading: {cache_err}")
            SUMMARIZER = pipeline("summarization", model=model_path, device=0 if torch.cuda.is_available() else -1)
    except Exception as e:
        logger.warning(f"Falling back to default BART: {e}")
        try:
            SUMMARIZER = pipeline("summarization", model=BART_BASE, device=0 if torch.cuda.is_available() else -1)
        except Exception as fallback_err:
            logger.error(f"Could not load any summarization model: {fallback_err}")
            SUMMARIZER = None

    # Load multilingual translator
    try:
        mbart_tok = MBart50TokenizerFast.from_pretrained(MBART_BASE)
        mbart_model = MBartForConditionalGeneration.from_pretrained(MBART_BASE)
        TRANSLATOR_TO_EN = (mbart_model, mbart_tok)
        TRANSLATOR_FROM_EN = (mbart_model, mbart_tok)
        logger.info("✅ mBART translation pipelines initialized.")
    except Exception as e:
        logger.warning(f"Translation modules unavailable: {e}")
        TRANSLATOR_TO_EN = TRANSLATOR_FROM_EN = None


# ============================================================
# 🌍 Translation Helpers
# ============================================================
def detect_and_translate_to_en(text: str) -> Tuple[str, Optional[str]]:
    """Detects language and translates to English if needed."""
    if not TRANSLATOR_TO_EN:
        return text, None

    model, tokenizer = TRANSLATOR_TO_EN
    lang = "en_XX"
    if any("\u0900" <= ch <= "\u097F" for ch in text):
        lang = "hi_IN"
    elif any("\u0B80" <= ch <= "\u0BFF" for ch in text):
        lang = "ta_IN"
    elif any("\u0C80" <= ch <= "\u0CFF" for ch in text):
        lang = "kn_IN"

    try:
        tokenizer.src_lang = lang
        encoded = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        gen = model.generate(**encoded, forced_bos_token_id=tokenizer.lang_code_to_id["en_XX"], max_length=1024)
        decoded = tokenizer.batch_decode(gen, skip_special_tokens=True)[0]
        return decoded, lang
    except Exception as e:
        logger.warning(f"Translation to English failed: {e}")
        return text, None


def translate_en_to_lang(text_en: str, target_lang_code: str) -> str:
    """Translate English text into target language (e.g., hi_IN, ta_IN)."""
    if not TRANSLATOR_FROM_EN or not target_lang_code:
        return text_en
    model, tokenizer = TRANSLATOR_FROM_EN
    try:
        tokenizer.src_lang = "en_XX"
        encoded = tokenizer(text_en, return_tensors="pt", truncation=True, padding=True)
        forced_id = tokenizer.lang_code_to_id.get(target_lang_code, tokenizer.lang_code_to_id["en_XX"])
        gen = model.generate(**encoded, forced_bos_token_id=forced_id, max_length=1024)
        decoded = tokenizer.batch_decode(gen, skip_special_tokens=True)[0]
        return decoded
    except Exception as e:
        logger.warning(f"Back translation failed: {e}")
        return text_en


# ============================================================
# 🧠 Summarization / Simplification
# ============================================================
def _smart_summary(text, max_len=150, min_len=40):
    """Internal helper for summarization."""
    text = text.strip()
    if len(text.split()) < 5:
        return text
    adaptive_max = min(max_len, len(text.split()))
    adaptive_min = max(10, int(adaptive_max * 0.4))

    if SUMMARIZER is None:
        return " ".join(text.split()[:adaptive_max])

    out = SUMMARIZER(text, max_length=adaptive_max, min_length=adaptive_min, do_sample=False)
    return out[0]["summary_text"]


def summarize_text(text: str, output_lang: str = "en_XX") -> str:
    """Summarize and return text in target language."""
    text = text.strip()
    if not text:
        return "No text provided."
    if ML_AVAILABLE and SUMMARIZER is None:
        _init_pipelines()

    translated, src_lang = detect_and_translate_to_en(text)
    try:
        chunks = [translated[i:i + 1000] for i in range(0, len(translated), 1000)]
        results = [_smart_summary(c) for c in chunks]
        summary_en = " ".join(results)
    except Exception as e:
        return f"Error summarizing: {e}"

    if output_lang != "en_XX":
        return translate_en_to_lang(summary_en, output_lang)
    if src_lang and src_lang != "en_XX":
        return translate_en_to_lang(summary_en, src_lang)
    return summary_en


def simplify_text(text: str, output_lang: str = "en_XX") -> str:
    """Simplify text and return in target language."""
    text = text.strip()
    if not text:
        return "No text provided."
    if ML_AVAILABLE and SUMMARIZER is None:
        _init_pipelines()

    translated, src_lang = detect_and_translate_to_en(text)
    try:
        simp_en = _smart_summary(translated, max_len=100, min_len=30)
    except Exception as e:
        return f"Error simplifying: {e}"

    if output_lang != "en_XX":
        return translate_en_to_lang(simp_en, output_lang)
    if src_lang and src_lang != "en_XX":
        return translate_en_to_lang(simp_en, src_lang)
    return simp_en


# ============================================================
# 📚 Unified Dataset Loader
# ============================================================
def _load_unified_dataset() -> List[Dict[str, str]]:
    data = []
    try:
        ipc_path = "backend/data/ipc_qa.json"
        if os.path.exists(ipc_path):
            with open(ipc_path, "r", encoding="utf-8") as f:
                ipc = json.load(f)
                for item in ipc:
                    if q := item.get("question"):
                        data.append({"text": q, "summary": item.get("answer", "")})
    except Exception as e:
        logger.warning(f"IPC dataset load failed: {e}")

    try:
        csv_path = "backend/data/laws_dataset.csv"
        if os.path.exists(csv_path) and pd is not None:
            df = pd.read_csv(csv_path)
            for _, row in df.iterrows():
                text = str(row.get("law", row.get("section_text", "")))
                if text:
                    data.append({
                        "text": text,
                        "summary": str(row.get("summary", row.get("meaning", "")))
                    })
    except Exception as e:
        logger.warning(f"CSV dataset load failed: {e}")

    try:
        custom_path = "backend/data/train_data.json"
        if os.path.exists(custom_path):
            with open(custom_path, "r", encoding="utf-8") as f:
                custom = json.load(f)
                for item in custom:
                    if text := item.get("text", item.get("input")):
                        data.append({"text": text, "summary": item.get("summary", item.get("output", ""))})
    except Exception as e:
        logger.warning(f"Custom dataset load failed: {e}")

    valid = [d for d in data if d["text"] and d["summary"]]
    logger.info(f"Unified dataset loaded: {len(valid)} valid entries")
    return valid


# ============================================================
# 🧠 Fine-tuning Trainer
# ============================================================
def train_custom_bart_json(dataset_path: Optional[str] = None, model_save_path: str = "backend/models/legal_bart_json") -> str:
    if not ML_AVAILABLE:
        raise RuntimeError("ML stack unavailable.")

    session = SessionLocal()
    job = TrainJob(filename=os.path.basename(dataset_path or "unified"), status="queued")
    session.add(job); session.commit(); session.refresh(job)

    try:
        job.status = "running"; session.commit()

        if dataset_path and os.path.exists(dataset_path):
            with open(dataset_path, "r", encoding="utf-8") as f:
                raw = json.load(f)
            data = [{"text": e.get("question", e.get("text", "")), "summary": e.get("answer", e.get("summary", ""))} for e in raw]
        else:
            data = _load_unified_dataset()

        if not data:
            raise ValueError("Empty dataset.")

        dataset = Dataset.from_dict({"text": [d["text"] for d in data], "summary": [d["summary"] for d in data]})
        multilingual = any(any("\u0900" <= ch <= "\u097F" for ch in d["text"]) for d in data)

        if multilingual:
            tokenizer = MBart50TokenizerFast.from_pretrained(MBART_BASE)
            model = MBartForConditionalGeneration.from_pretrained(MBART_BASE)
        else:
            tokenizer = BartTokenizer.from_pretrained(BART_BASE)
            model = BartForConditionalGeneration.from_pretrained(BART_BASE)

        def preprocess(batch):
            inputs = tokenizer(batch["text"], max_length=512, truncation=True, padding="max_length")
            labels = tokenizer(batch["summary"], max_length=128, truncation=True, padding="max_length")
            inputs["labels"] = labels["input_ids"]
            return inputs

        tokenized = dataset.map(preprocess, batched=True, remove_columns=dataset.column_names)
        data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

        version_name = f"legal_model_{int(time.time())}"
        save_path = os.path.join("backend/models", version_name)
        os.makedirs(save_path, exist_ok=True)

        args = TrainingArguments(
            output_dir=save_path,
            num_train_epochs=int(os.getenv("TRAIN_EPOCHS", DEFAULT_TRAIN_EPOCHS)),
            per_device_train_batch_size=2,
            save_strategy="epoch",
            logging_dir="./logs",
            logging_steps=50,
            report_to="none",
            fp16=torch.cuda.is_available(),
        )

        trainer = Trainer(
            model=model,
            args=args,
            train_dataset=tokenized,
            tokenizer=tokenizer,
            data_collator=data_collator,
        )

        trainer.train()
        model.save_pretrained(save_path)
        tokenizer.save_pretrained(save_path)

        session.query(ModelVersion).update({ModelVersion.active: False})
        mv = ModelVersion(version_name=version_name, path=save_path, dataset="unified", active=True)
        session.add(mv); session.commit()

        job.status = "done"; job.detail = f"Saved to {save_path}"
        session.commit()

        reload_summarizer(save_path)
        return save_path

    except Exception as e:
        job.status = "failed"; job.detail = str(e); session.commit()
        raise
    finally:
        session.close()


# ============================================================
# ♻️ Reload Active Model
# ============================================================
def reload_summarizer(model_path: str):
    global SUMMARIZER
    if not ML_AVAILABLE:
        logger.warning("⚠️ ML stack missing — cannot reload summarizer.")
        return
    try:
        SUMMARIZER = pipeline("summarization", model=model_path, device=0 if torch.cuda.is_available() else -1)
        logger.info("✅ Summarizer reloaded from %s", model_path)
    except Exception as e:
        logger.warning("⚠️ Failed to reload summarizer: %s", e)
