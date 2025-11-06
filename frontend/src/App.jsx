import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FineTunePanel from "./components/FineTunePanel";
import OutputPanel from "./components/OutputPanel";
import { processFile, processText } from "./api";
import axios from "axios";

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fineTuneStatus, setFineTuneStatus] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Use environment variable if available, fallback to localhost
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";


  //  Handle File Upload for Summarization
  const handleFile = async (file) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await processFile(file);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert(
        "Error processing file: " +
          (err?.response?.data?.detail || err.message)
      );
    } finally {
      setLoading(false);
    }
  };
  //  Handle Manual Text Input
  const handleTextSubmit = async (text) => {
    setLoading(true);
    setResult(null);
    try {
      const res = await processText(text);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert(
        "Error processing text: " +
          (err?.response?.data?.detail || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  
  //  Handle Fine-Tuning Upload

  const handleFineTuneUpload = async (file) => {
    if (!file) return alert("Please select a JSON dataset to fine-tune.");

    setFineTuneStatus("📤 Uploading dataset & starting training...");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(`${API_BASE}/train-json`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });

      setFineTuneStatus(
        `✅ Model fine-tuned successfully! Saved at: ${response.data.model_path}`
      );
      setUploadProgress(100);
    } catch (err) {
      console.error("❌ Fine-tuning error:", err);
      setFineTuneStatus(
        "❌ Fine-tuning failed: " +
          (err?.response?.data?.detail || err.message)
      );
    }
  };

  
  //  UI
 
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <Navbar />

      <main>
        {/* 🧠 Hero Section */}
        <Hero onFile={handleFile} onTextSubmit={handleTextSubmit} />

        {/* 📄 Summarization Results */}
        <section
          id="simplify"
          className="max-w-7xl mx-auto px-6 py-10 border-b border-slate-800"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-amber-400">
            Simplified & Summarized Output
          </h2>
          {loading ? (
            <div className="text-center text-slate-400 animate-pulse">
              🌀 Processing... please wait
            </div>
          ) : (
            <OutputPanel result={result} />
          )}
        </section>

        {/* 🧩 Fine-Tuning Section */}
        <section
          id="finetune"
          className="max-w-7xl mx-auto px-6 py-10 border-t border-slate-700"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-amber-400">
            Fine-Tune Your AI Model
          </h2>

          {/* Fine-tune panel */}
          <FineTunePanel onUpload={handleFineTuneUpload} />

          {/* Upload progress bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4 max-w-xl mx-auto">
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="text-xs text-center mt-1 text-slate-400">
                Upload progress: {uploadProgress}%
              </div>
            </div>
          )}

          {/* Fine-tune status */}
          {fineTuneStatus && (
            <p className="mt-6 text-center text-slate-300 animate-pulse">
              {fineTuneStatus}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
