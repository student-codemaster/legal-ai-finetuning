import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import LanguageSelector from "../components/LanguageSelector";
import ResultCard from "../components/ResultCard";

export default function UserDashboard() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en_XX");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSimplify = async () => {
    if (!text.trim()) {
      alert("Please enter some legal text");
      return;
    }

    setLoading(true);
    try {
      const res = await API.post("/process-text", { text, lang });
      setResult(res.data);
    } catch (e) {
      alert("Error processing text: " + (e.response?.data?.detail || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("is_admin");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/5 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⚖️</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-blue-500 bg-clip-text text-transparent">
              LawEase Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/user/profile")}
              className="px-4 py-2 text-gray-300 hover:text-blue-300 transition text-sm font-medium"
            >
              📋 History
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/30 rounded-lg transition text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <span>📝</span> Paste Your Legal Text
              </h2>

              <textarea
                className="w-full h-64 p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder="Paste your legal document, contract, or law text here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>

              <div className="flex gap-3 items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Language
                  </label>
                  <LanguageSelector lang={lang} setLang={setLang} />
                </div>

                <button
                  onClick={handleSimplify}
                  disabled={loading || !text.trim()}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Processing...
                    </span>
                  ) : (
                    <span>✨ Simplify & Summarize</span>
                  )}
                </button>
              </div>

              {/* Character Count */}
              <div className="text-xs text-gray-400">
                {text.length} characters
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-blue-300">✨ Features</h3>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Auto-detect language</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Simplify complex text</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Generate summaries</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Find related laws</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">✓</span>
                  <span>Multi-language support</span>
                </li>
              </ul>
            </div>

            {/* Supported Languages */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-blue-300 mb-3">🌐 Languages</h3>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                <div className="bg-white/5 p-2 rounded">🇬🇧 English</div>
                <div className="bg-white/5 p-2 rounded">🇮🇳 हिन्दी</div>
                <div className="bg-white/5 p-2 rounded">🇮🇳 தமிழ்</div>
                <div className="bg-white/5 p-2 rounded">🇮🇳 ಕನ್ನಡ</div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8">
            <ResultCard result={result} />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
