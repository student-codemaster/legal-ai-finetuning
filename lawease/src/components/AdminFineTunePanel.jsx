// src/components/AdminFineTunePanel.jsx
import React, { useState, useEffect, useRef } from "react";
import { uploadTrainDataset, getTrainStatus, getModels, activateModel } from "../utils/api";

export default function AdminFineTunePanel({ onModelsUpdated }) {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [models, setModels] = useState([]);
  const pollRef = useRef(null);

  useEffect(() => {
    fetchModels();
    return () => stopPolling();
  }, []);

  const fetchModels = async () => {
    try {
      const data = await getModels();
      setModels(data);
      if (onModelsUpdated) onModelsUpdated(data);
    } catch (e) {
      console.error("Failed to fetch models", e);
    }
  };

  const startPolling = (id) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const st = await getTrainStatus(id);
        setStatus(st.status);
        setLogs((prev) => {
          const next = [...prev];
          next.push(`[${new Date().toLocaleTimeString()}] ${st.status} ${st.detail || ""}`);
          return next.slice(-200); // keep last 200 lines
        });
        if (st.status === "done" || st.status === "failed") {
          stopPolling();
          await fetchModels();
        }
      } catch (e) {
        console.warn("poll error", e);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select JSON dataset first.");
    try {
      setLogs([]);
      setStatus("queued");
      const res = await uploadTrainDataset(file);
      if (res.job_id) {
        setJobId(res.job_id);
        startPolling(res.job_id);
      } else if (res.status && res.job_id) {
        setJobId(res.job_id);
        startPolling(res.job_id);
      } else {
        alert("Unexpected response from server.");
      }
    } catch (e) {
      alert("Upload failed: " + (e?.response?.data?.detail || e.message));
    }
  };

  const onActivate = async (id) => {
    try {
      await activateModel(id);
      alert("Activated!");
      fetchModels();
    } catch (e) {
      alert("Activate failed");
    }
  };

  return (
    <div className="bg-gray-800/60 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-lg font-semibold mb-3 text-cyan-300">Fine-tune Model</h3>

      <div className="flex gap-3 items-center mb-4">
        <input
          type="file"
          accept=".json"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm text-gray-300"
        />
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-md"
        >
          Upload & Start Training
        </button>
        <div className="text-sm text-gray-400">{jobId ? `Job: ${jobId}` : ""}</div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm text-gray-300 mb-2">Models</h4>
        <div className="space-y-2">
          {models.length === 0 && <div className="text-gray-400">No models found.</div>}
          {models.map((m) => (
            <div key={m.id} className="flex justify-between items-center bg-gray-900 p-3 rounded-md">
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-400">{m.dataset || m.path}</div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="text-xs text-gray-300">{m.active ? "Active" : "Inactive"}</div>
                {!m.active && (
                  <button onClick={() => onActivate(m.id)} className="px-3 py-1 bg-blue-600 rounded">
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm text-gray-300 mb-2">Live Job Logs</h4>
        <div className="h-40 overflow-auto bg-gray-900 rounded p-3 text-xs text-gray-200 border border-gray-700">
          {logs.length === 0 && <div className="text-gray-500">No logs yet.</div>}
          {logs.map((l, i) => (
            <div key={i} className="whitespace-pre-wrap">{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
