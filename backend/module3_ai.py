from transformers import (
    pipeline,
    BartForConditionalGeneration,
    BartTokenizer,
    Trainer,
    TrainingArguments,
)
from datasets import Dataset
import json, os

# ---------------------------
# ✅ Model Configuration
# ---------------------------
MODEL_NAME = "facebook/bart-large-cnn"

# Try loading fine-tuned model if available
MODEL_PATH = "backend/models/legal_bart_json"
if os.path.exists(MODEL_PATH):
    print(f"✅ Loading fine-tuned model from {MODEL_PATH}")
    summarizer = pipeline("summarization", model=MODEL_PATH)
else:
    print(f"⚠️ Fine-tuned model not found, using base model.")
    summarizer = pipeline("summarization", model=MODEL_NAME)


# ---------------------------
# ✅ Utility: Smart Length Control
# ---------------------------
def _smart_summary(text, max_len=150, min_len=40):
    """Dynamically adjusts summary length based on input size."""
    text = text.strip()
    input_len = len(text.split())

    if input_len < 5:
        return text  # too short

    adaptive_max = min(max_len, input_len)
    adaptive_min = max(10, int(adaptive_max * 0.4))

    res = summarizer(
        text,
        max_length=adaptive_max,
        min_length=adaptive_min,
        do_sample=False,
    )
    return res[0]["summary_text"]


# ---------------------------
# ✅ Simple Summarization
# ---------------------------
def summarize_text(text: str) -> str:
    """Summarizes large text in chunks."""
    text = text.strip()
    if not text:
        return "No text provided."

    if len(text.split()) < 30:
        return text  # skip very short text

    chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
    results = []
    for chunk in chunks:
        try:
            summary = _smart_summary(chunk, max_len=150, min_len=40)
            results.append(summary)
        except Exception as e:
            results.append(f"[Error summarizing chunk: {e}]")

    return " ".join(results)


# ---------------------------
# ✅ Simplification Function
# ---------------------------
def simplify_text(text: str) -> str:
    """Simplifies legal or complex text into easier language."""
    text = text.strip()
    if not text:
        return "No text provided."

    if len(text.split()) < 20:
        return text

    try:
        simplified = _smart_summary(text, max_len=120, min_len=30)
        return simplified
    except Exception as e:
        return f"Error simplifying: {e}"


# ---------------------------
# ✅ Fine-Tuning Function
# ---------------------------
def train_custom_bart_json(dataset_path: str, model_save_path: str = "backend/models/legal_bart_json"):
    """
    Fine-tunes BART model on a legal text dataset.
    JSON format expected:
        [{"text": "...", "summary": "..."}, {"question": "...", "answer": "..."}]
    """
    print(f"🚀 Fine-tuning BART with dataset: {dataset_path}")

    model = BartForConditionalGeneration.from_pretrained(MODEL_NAME)
    tokenizer = BartTokenizer.from_pretrained(MODEL_NAME)

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

    dataset = Dataset.from_dict({"text": texts, "summary": summaries})

    def preprocess(batch):
        model_inputs = tokenizer(
            batch["text"], max_length=512, truncation=True, padding="max_length"
        )
        with tokenizer.as_target_tokenizer():
            labels = tokenizer(
                batch["summary"], max_length=128, truncation=True, padding="max_length"
            )
        model_inputs["labels"] = labels["input_ids"]
        return model_inputs

    tokenized = dataset.map(preprocess, batched=True)

    args = TrainingArguments(
        output_dir=model_save_path,
        num_train_epochs=1,
        per_device_train_batch_size=2,
        save_strategy="epoch",
        logging_dir="./logs",
        logging_steps=20,
        report_to="none",
    )

    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=tokenized,
        tokenizer=tokenizer,
    )

    trainer.train()

    os.makedirs(model_save_path, exist_ok=True)
    model.save_pretrained(model_save_path)
    tokenizer.save_pretrained(model_save_path)
    print(f"✅ Model saved at {model_save_path}")
    return model_save_path


# ---------------------------
# ✅ Reload Summarizer
# ---------------------------
def reload_summarizer(model_path: str):
    """Reload summarizer pipeline from a fine-tuned model."""
    global summarizer
    summarizer = pipeline("summarization", model=model_path)
    print(f"✅ Summarizer reloaded from {model_path}")


# ---------------------------
# ✅ RAG Summarization (with law context)
# ---------------------------
from backend.module2_processing import extract_articles, clean_text
from backend.module4_lawlink import get_context_text

def summarize_with_rag(text: str) -> str:
    """
    Retrieval-Augmented Generation:
    1️⃣ Cleans and extracts law references
    2️⃣ Retrieves relevant context
    3️⃣ Combines both for enhanced summarization
    """
    text = text.strip()
    if not text:
        return "No text provided."

    # Step 1: clean and extract references
    text_clean = clean_text(text)
    refs = extract_articles(text_clean)

    # Step 2: retrieve context
    context = get_context_text(refs)

    # Step 3: combine
    combined = f"{text_clean}\n\n{context}"

    try:
        result = summarizer(combined, max_length=180, min_length=50, do_sample=False)
        return result[0]["summary_text"]
    except Exception as e:
        return f"⚠️ Error during RAG summarization: {e}"
