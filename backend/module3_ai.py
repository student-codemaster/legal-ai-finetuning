from transformers import pipeline

summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def summarize_text(text):
    chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
    results = []
    for chunk in chunks:
        out = summarizer(chunk, max_length=150, min_length=40, do_sample=False)
        results.append(out[0]["summary_text"])
    return " ".join(results)

def simplify_text(text):
    out = summarizer(text, max_length=120, min_length=40, do_sample=False)
    return out[0]["summary_text"]
