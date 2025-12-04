import React, { useState } from "react";
import API from "../utils/api";
import LanguageSelector from "../components/LanguageSelector";
import ResultCard from "../components/ResultCard";

export default function UserDashboard() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en_XX");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimplify = async () => {
    setLoading(true);
    try {
      const res = await API.post("/process-text", { text, lang });
      setResult(res.data);
    } catch (e) {
      alert("Error processing text");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-400">LawEase Simplifier</h1>
        <LanguageSelector lang={lang} setLang={setLang} />
      </div>

      <textarea
        className="w-full h-48 p-4 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-blue-500"
        placeholder="Paste or type your legal text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      ></textarea>

      <button
        onClick={handleSimplify}
        disabled={loading}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
      >
        {loading ? "Processing..." : "Simplify & Summarize"}
      </button>

      {result && <ResultCard result={result} />}
    </div>
  );
}
