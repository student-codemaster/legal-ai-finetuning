import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    fetchQueries();
  }, []);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/queries`);
      setQueries(res.data);
    } catch (err) {
      console.error("Error fetching queries:", err);
    }
    setLoading(false);
  };

  const deleteQuery = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    await axios.delete(`${API_BASE}/admin/query/${id}`);
    fetchQueries();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-10">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        ⚖️ Admin Dashboard
      </motion.h1>

      {loading ? (
        <p className="text-gray-400 text-center">Loading queries...</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {queries.map((q) => (
            <motion.div
              key={q.id}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800 rounded-2xl p-5 shadow-xl border border-gray-700"
              onClick={() => setSelected(q)}
            >
              <h2 className="text-xl font-semibold mb-2">🧾 Query #{q.id}</h2>
              <p className="text-gray-300 line-clamp-2 mb-3">{q.input_text}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteQuery(q.id);
                }}
                className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm"
              >
                Delete
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-gray-800 rounded-2xl p-8 w-full max-w-3xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">📜 Full Query #{selected.id}</h2>
            <p className="mb-2 text-gray-400">
              <b>Input:</b> {selected.input_text}
            </p>
            <p className="mb-2 text-gray-400">
              <b>Summary:</b> {selected.summary}
            </p>
            <p className="mb-2 text-gray-400">
              <b>Simplified:</b> {selected.simplified}
            </p>
            <button
              onClick={() => setSelected(null)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
