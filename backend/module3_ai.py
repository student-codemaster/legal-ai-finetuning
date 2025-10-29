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
# Global Model Configuration
# ---------------------------
MODEL_NAME = "facebook/bart-large-cnn"
summarizer = pipeline("summarization", model=MODEL_NAME)

# ---------------------------
# Utility: Smart Length Control
# ---------------------------
def _smart_summary(text, max_len=150, min_len=40):
    """Helper function that dynamically adjusts summary length."""
    text = text.strip()
    input_len = len(text.split())

    if input_len < 5:
        # Too short to summarize meaningfully
        return text

    # Dynamically reduce max/min length to avoid warnings
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
# Summarization Function
# ---------------------------
def summarize_text(text: str) -> str:
    """
    Summarizes large text in chunks, dynamically adjusting output length.
    """
    text = text.strip()
    if not text:
        return "No text provided."

    if len(text.split()) < 30:
        return text  # Skip very short text

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
# Simplification Function
# ---------------------------
def simplify_text(text: str) -> str:
    """
    Produces a simpler summary of the text (shorter and easier to read).
    """
    text = text.strip()
    if not text:
        return "No text provided."

    if len(text.split()) < 20:
        return text  # Return as-is if too short

    try:
        simplified = _smart_summary(text, max_len=120, min_len=30)
        return simplified
    except Exception as e:
        return f"Error simplifying: {e}"

# ---------------------------
# Fine-Tuning on JSON Dataset
# ---------------------------
def train_custom_bart_json(dataset_path: str, model_save_path: str = "models/legal_bart_json"):
    """
    Fine-tunes BART on a given JSON dataset (fields: question/answer or text/summary).
    """
    print(f"🚀 Fine-tuning BART with dataset: {dataset_path}")

    # Load base model & tokenizer
    model = BartForConditionalGeneration.from_pretrained(MODEL_NAME)
    tokenizer = BartTokenizer.from_pretrained(MODEL_NAME)

    # Load dataset
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

    # Preprocessing
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

    # Training configuration
    args = TrainingArguments(
        output_dir=model_save_path,
        num_train_epochs=1,
        per_device_train_batch_size=2,
        save_strategy="epoch",
        logging_dir="./logs",
        logging_steps=20,
        report_to="none",  # prevents W&B logging
    )

    # Trainer
    trainer = Trainer(
        model=model,
        args=args,
        train_dataset=tokenized,
        tokenizer=tokenizer,
    )

    trainer.train()

    # Save fine-tuned model
    os.makedirs(model_save_path, exist_ok=True)
    model.save_pretrained(model_save_path)
    tokenizer.save_pretrained(model_save_path)

    print(f"✅ Model saved at {model_save_path}")
    return model_save_path

# ---------------------------
# Reload Fine-tuned Summarizer
# ---------------------------
def reload_summarizer(model_path: str):
    """
    Reloads the summarizer pipeline using a fine-tuned model path.
    """
    global summarizer
    summarizer = pipeline("summarization", model=model_path)
    print(f"✅ Summarizer reloaded from {model_path}")
