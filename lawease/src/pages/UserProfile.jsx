// src/pages/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { getAllQueries } from "../utils/api";

export default function UserProfile() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getAllQueries();
      // If backend returns all queries, you may filter by current user here (needs user id)
      setHistory(data);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-cyan-300 mb-6">Your Query History</h1>

        {loading && <div className="text-gray-400">Loading...</div>}

        {!loading && history.length === 0 && (
          <div className="text-gray-400">No history found.</div>
        )}

        <div className="space-y-4">
          {history.map((q) => (
            <div key={q.id} className="bg-gray-800 p-4 rounded-md border border-gray-700">
              <div className="text-sm text-gray-300 mb-2">{new Date(q.id * 1000).toLocaleString ? "" : ""}</div>
              <div className="font-medium text-sm text-cyan-200">Input</div>
              <div className="text-sm text-gray-200 mb-3 whitespace-pre-wrap">{q.input_text}</div>

              <div className="font-medium text-sm text-cyan-200">Summary</div>
              <div className="text-sm text-gray-200 mb-3">{q.summary}</div>

              <div className="font-medium text-sm text-cyan-200">Simplified</div>
              <div className="text-sm text-gray-200">{q.simplified}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
