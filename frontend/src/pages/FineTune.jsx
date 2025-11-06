import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Text3D } from "@react-three/drei";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export default function FineTunePage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [isTraining, setIsTraining] = useState(false);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleFineTune = async () => {
    if (!file) {
      alert("Please upload a dataset file first!");
      return;
    }

    setIsTraining(true);
    setStatus("🚀 Starting fine-tuning process...");
    setLogs([]);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${API_BASE}/train-json`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          setStatus(`📤 Uploading dataset... ${Math.round((p.loaded / p.total) * 100)}%`);
        },
      });

      setStatus("✅ Fine-tuning complete!");
      setLogs((prev) => [...prev, JSON.stringify(res.data, null, 2)]);
    } catch (err) {
      setStatus("❌ Error during fine-tuning");
      setLogs((prev) => [...prev, err.message]);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center">
      {/* ====== Header ====== */}
      <header className="w-full p-5 text-center border-b border-gray-700">
        <h1 className="text-3xl font-bold text-blue-400">
          ⚖️ AI Legal Simplifier – Model Fine-Tuning
        </h1>
        <p className="text-gray-400 text-sm mt-2">
          Upload your legal dataset (.json) and train your own AI summarizer.
        </p>
      </header>

      {/* ====== 3D Animation ====== */}
      <div className="h-60 w-full">
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <Float>
            <Text3D font="/Inter_Bold.json" size={0.7} height={0.2}>
              LEGAL AI
              <meshStandardMaterial color="#3b82f6" />
            </Text3D>
          </Float>
          <OrbitControls enableZoom={false} />
        </Canvas>
      </div>

      {/* ====== Upload Section ====== */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-800 rounded-2xl shadow-xl p-8 w-[90%] max-w-2xl mt-5"
      >
        <h2 className="text-xl font-semibold mb-4">Upload Dataset</h2>

        <input
          type="file"
          accept=".json"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0 file:text-sm file:font-semibold
                     file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFineTune}
          disabled={isTraining}
          className="mt-6 w-full bg-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-gray-600"
        >
          {isTraining ? "Training in Progress..." : "Start Fine-Tuning"}
        </motion.button>

        {/* ====== Status ====== */}
        <div className="mt-5">
          <p className="text-gray-300 font-mono">{status}</p>
          <pre className="bg-black text-green-400 text-xs p-3 rounded-lg mt-3 max-h-40 overflow-y-auto">
            {logs.join("\n")}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}
