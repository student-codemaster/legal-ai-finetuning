# backend/module3_ai.py
import os, json, torch, time
from transformers import (
    pipeline,
    BartForConditionalGeneration,
    BartTokenizer,
    MBartForConditionalGeneration,
    MBart50TokenizerFast,
    Trainer,
    TrainingArguments,
    DataCollatorForSeq2Seq
)
from datasets import Dataset
from .config import MODEL_PATH, BART_MODEL_NAME, MBART_MODEL_NAME, BASE_MODEL_DIR, DEFAULT_TRAIN_EPOCHS
from .database import SessionLocal, ModelVersion, TrainJob
from .module2_processing import clean_text, extract_articles
from .module4_lawlink import get_context_text
from .config import MODEL_PATH, BART_MODEL_NAME, MBART_MODEL_NAME, BASE_MODEL_DIR, DEFAULT_TRAIN_EPOCHS


# Default model names (fallback)
BART_BASE = os.getenv("BART_MODEL_NAME", "facebook/bart-large-cnn")
MBART_BASE = os.getenv("MBART_MODEL_NAME", "facebook/mbart-large-50-many-to-many-mmt")

# model pipeline variables
ACTIVE_MODEL_PATH = os.getenv("ACTIVE_MODEL_PATH", None)
SUMMARIZER = None

# translation pipeline (mBART)
TRANSLATOR_TO_EN = None
TRANSLATOR_FROM_EN = None

# initialize pipelines
def _init_pipelines():
    global SUMMARIZER, TRANSLATOR_TO_EN, TRANSLATOR_FROM_EN
    # summarizer: try to load fine-tuned model in models/active else base
    active_path = os.getenv("ACTIVE_MODEL_PATH", "backend/models/legal_bart_json")
    if os.path.exists(active_path):
        try:
            SUMMARIZER = pipeline("summarization", model=active_path, device=0 if torch.cuda.is_available() else -1)
        except Exception:
            SUMMARIZER = pipeline("summarization", model=BART_BASE, device=0 if torch.cuda.is_available() else -1)
    else:
        SUMMARIZER = pipeline("summarization", model=BART_BASE, device=0 if torch.cuda.is_available() else -1)

    # mBART translation pipelines (many-to-many)
    try:
        mbart_tok = MBart50TokenizerFast.from_pretrained(MBART_BASE)
        mbart_model = MBartForConditionalGeneration.from_pretrained(MBART_BASE)
        # translators: we'll use tokenizer + model directly in functions below
        TRANSLATOR_TO_EN = (mbart_model, mbart_tok)
        TRANSLATOR_FROM_EN = (mbart_model, mbart_tok)
    except Exception as e:
        TRANSLATOR_TO_EN = None
        TRANSLATOR_FROM_EN = None

_init_pipelines()


# ---------------------------
# Translation helpers (mBART based)
# ---------------------------
def detect_and_translate_to_en(text: str):
    """
    Detect language heuristically (mbart needs forced language code).
    We'll attempt to translate unknown languages to English using mbart.
    If mbart unavailable, return original text.
    """
    if not TRANSLATOR_TO_EN:
        return text, None  # no translator
    model, tokenizer = TRANSLATOR_TO_EN
    # MBART requires src_lang set; we'll attempt common langs by quick heuristic
    # For robustness, we just set lang to 'hi_IN' if Devanagari characters present, else assume input
    lang = "en_XX"
    # simple heuristics
    if any("\u0900" <= ch <= "\u097F" for ch in text):  # Devanagari
        lang = "hi_IN"
    # Note: MBart tokenizer expects language codes like 'hi_IN' and 'en_XX' mapping might vary
    try:
        tokenizer.src_lang = lang
        encoded = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        generated_tokens = model.generate(**encoded, forced_bos_token_id=tokenizer.lang_code_to_id["en_XX"], max_length=1024)
        decoded = tokenizer.batch_decode(generated_tokens, skip_special_tokens=True)[0]
        return decoded, lang
    except Exception:
        return text, None

def translate_en_to_lang(text_en: str, target_lang_code: str):
    if not TRANSLATOR_FROM_EN or not target_lang_code:
        return text_en
    model, tokenizer = TRANSLATOR_FROM_EN
    try:
        tokenizer.src_lang = "en_XX"
        encoded = tokenizer(text_en, return_tensors="pt", truncation=True, padding=True)
        generated = model.generate(**encoded, forced_bos_token_id=tokenizer.lang_code_to_id.get(target_lang_code, tokenizer.lang_code_to_id.get("en_XX")), max_length=1024)
        decoded = tokenizer.batch_decode(generated, skip_special_tokens=True)[0]
        return decoded
    except Exception:
        return text_en


# ---------------------------
# summarization (keeps same name)
# ---------------------------
def _smart_summary(text, max_len=150, min_len=40):
    text = text.strip()
    input_len = len(text.split())
    if input_len < 5:
        return text
    adaptive_max = min(max_len, input_len)
    adaptive_min = max(10, int(adaptive_max * 0.4))
    out = SUMMARIZER(text, max_length=adaptive_max, min_length=adaptive_min, do_sample=False)
    return out[0]["summary_text"]

def summarize_text(text: str) -> str:
    """
    Preserves previous behavior: if non-English, translate to English -> summarize -> translate back.
    """
    text = text.strip()
    if not text:
        return "No text provided."

    # Detect and translate
    translated, src_lang = detect_and_translate_to_en(text)
    # If translation happened, summarize translated and then back-translate
    try:
        if len(translated.split()) < 30:
            summary_en = translated
        else:
            # chunking like before
            chunks = [translated[i:i+1000] for i in range(0, len(translated), 1000)]
            results = []
            for chunk in chunks:
                results.append(_smart_summary(chunk, max_len=150, min_len=40))
            summary_en = " ".join(results)
    except Exception as e:
        return f"Error summarizing: {e}"

    # translate back if needed
    if src_lang and src_lang != "en_XX":
        back = translate_en_to_lang(summary_en, src_lang)
        return back
    return summary_en

def simplify_text(text: str) -> str:
    # uses _smart_summary shorter target
    text = text.strip()
    if not text:
        return "No text provided."
    translated, src_lang = detect_and_translate_to_en(text)
    try:
        if len(translated.split()) < 20:
            simp_en = translated
        else:
            simp_en = _smart_summary(translated, max_len=120, min_len=30)
    except Exception as e:
        return f"Error simplifying: {e}"
    if src_lang and src_lang != "en_XX":
        return translate_en_to_lang(simp_en, src_lang)
    return simp_en


# ---------------------------
# Fine-tuning (keeps same name)
# ---------------------------
def train_custom_bart_json(dataset_path: str, model_save_path: str = "backend/models/legal_bart_json"):
    """
    Fine-tune BART on JSON dataset. Creates a ModelVersion and TrainJob.
    """
    print(f"🚀 Fine-tuning BART with dataset: {dataset_path}")
    session = SessionLocal()
    job = TrainJob(filename=os.path.basename(dataset_path), status="queued")
    session.add(job); session.commit(); session.refresh(job)

    try:
        # record running
        job.status = "running"
        session.commit()

        # load dataset
        with open(dataset_path, "r", encoding="utf-8") as f:
            raw = json.load(f)

        texts, summaries = [], []
        for entry in raw:
            if "question" in entry and "answer" in entry:
                texts.append(entry["question"])
                summaries.append(entry["answer"])
            elif "text" in entry and "summary" in entry:
                texts.append(entry["text"])
                summaries.append(entry["summary"])

        if not texts:
            job.status = "failed"; job.detail = "Empty dataset"; session.commit()
            raise ValueError("Dataset empty")

        dataset = Dataset.from_dict({"text": texts, "summary": summaries})

        tokenizer = BartTokenizer.from_pretrained(BART_BASE)
        model = BartForConditionalGeneration.from_pretrained(BART_BASE)

        def preprocess(batch):
            inputs = tokenizer(batch["text"], max_length=512, truncation=True, padding="max_length")
            labels = tokenizer(batch["summary"], max_length=128, truncation=True, padding="max_length")
            inputs["labels"] = labels["input_ids"]
            return inputs

        tokenized = dataset.map(preprocess, batched=True, remove_columns=dataset.column_names)

        data_collator = DataCollatorForSeq2Seq(tokenizer, model=model)

        # model save path include timestamp
        version_name = f"legal_bart_{int(time.time())}"
        save_path = os.path.join("backend", "models", version_name)
        os.makedirs(save_path, exist_ok=True)

        args = TrainingArguments(
            output_dir=save_path,
            overwrite_output_dir=True,
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

        # save
        model.save_pretrained(save_path)
        tokenizer.save_pretrained(save_path)

        # store version in DB and mark active
        mv = ModelVersion(version_name=version_name, path=save_path, dataset=os.path.basename(dataset_path), active=True)
        # deactivate others
        session.query(ModelVersion).update({ModelVersion.active: False})
        session.add(mv); session.commit()

        job.status = "done"
        job.detail = f"Saved to {save_path}"
        job.finished_at = torch.tensor(0) if False else None  # keep as placeholder
        session.commit()

        # reload summarizer to use this model
        reload_summarizer(save_path)

        return save_path
    except Exception as e:
        job.status = "failed"
        job.detail = str(e)
        session.commit()
        raise
    finally:
        session.close()


def reload_summarizer(model_path: str):
    # preserve function name
    global SUMMARIZER
    try:
        SUMMARIZER = pipeline("summarization", model=model_path, device=0 if torch.cuda.is_available() else -1)
        print(f"✅ Summarizer reloaded from {model_path}")
    except Exception as e:
        print("⚠️ Failed to reload summarizer, keeping previous model:", e)
