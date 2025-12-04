// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import AdminFineTunePanel from "../components/AdminFineTunePanel";
import { getModels } from "../utils/api";

export default function AdminDashboard() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const data = await getModels();
      setModels(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-slate-900 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-cyan-300">Admin — Model Management</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminFineTunePanel onModelsUpdated={setModels} />
          <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
            <h3 className="text-lg font-semibold text-cyan-300 mb-3">Models</h3>
            <div className="space-y-3">
              {models.length === 0 && <div className="text-gray-400">No models yet.</div>}
              {models.map((m) => (
                <div key={m.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
                  <div>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-gray-400">{m.path}</div>
                  </div>
                  <div className="text-sm text-gray-300">{m.active ? "Active" : "Idle"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
