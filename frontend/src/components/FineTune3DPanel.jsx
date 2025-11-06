// src/components/FineTune3DPanel.jsx
import React, { useRef, useState } from "react";
import axios from "axios";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";

/**
 * 3D Brain (procedural) - simple animated sphere
 */
function Brain({ hovered }) {
  const ref = useRef();
  useFrame((state, delta) => {
    // slow rotation
    ref.current.rotation.y += 0.2 * delta;
    ref.current.rotation.x += 0.08 * delta;
  });

  return (
    <mesh ref={ref} scale={1.35}>
      <icosahedronBufferGeometry args={[1, 6]} />
      <MeshDistortMaterial
        distort={hovered ? 0.6 : 0.35}
        speed={2.2}
        roughness={0.05}
        metalness={0.2}
        emissiveIntensity={0.8}
      />
    </mesh>
  );
}

/**
 * FineTune3DPanel component
 * - uploads JSON to /train-json
 * - shows upload progress and status
 * - 3D brain animates while training
 */
export default function FineTune3DPanel({
  apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
}) {
  const [file, setFile] = useState(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [status, setStatus] = useState("Idle");
  const [isTraining, setIsTraining] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] ?? null);
    setUploadPct(0);
    setResponse(null);
    setStatus("Ready to upload");
  };

  const handleTrain = async () => {
    if (!file) return alert("Please choose a .json dataset to fine-tune.");
    setIsTraining(true);
    setStatus("Uploading dataset...");
    setUploadPct(0);
    setResponse(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      // Long timeout because training may take long
      const res = await axios.post(`${apiBase}/train-json`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 1000 * 60 * 30, // 30 minutes
        onUploadProgress: (ev) => {
          if (!ev.lengthComputable) return;
          const pct = Math.round((ev.loaded / ev.total) * 100);
          setUploadPct(pct);
        },
      });

      setStatus("Fine-tuning finished");
      setResponse(res.data);
    } catch (err) {
      console.error("Fine-tune error:", err);
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Unknown error while fine-tuning";
      setStatus(`Error: ${msg}`);
      setResponse(err?.response?.data ?? { error: msg });
    } finally {
      setIsTraining(false);
      setUploadPct(100);
    }
  };

  return (
    <div className="relative bg-slate-900 text-white rounded-2xl p-6 shadow-xl overflow-hidden">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Left: UI */}
        <div>
          <h3 className="text-2xl font-bold text-amber-300 mb-2">
            Fine-tune your Legal AI
          </h3>
          <p className="text-slate-300 text-sm mb-4">
            Upload a JSON dataset (format: [{"{"} "text":"...","summary":"..." {"}"}] or
            {"{"}"question":"...","answer":"..."}{"}"}) to fine-tune the BART model.
          </p>

          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="mb-4 block w-full text-sm text-slate-200 file:rounded-full file:border-none file:px-4 file:py-2 file:bg-amber-500 file:text-slate-900"
          />

          <div className="flex gap-3">
            <button
              onClick={handleTrain}
              disabled={isTraining}
              className="bg-amber-500 px-5 py-2 rounded-lg font-semibold hover:brightness-105 disabled:opacity-60"
            >
              {isTraining ? "Training..." : "Start Fine-Tuning"}
            </button>

            <button
              onClick={() => {
                setFile(null);
                setUploadPct(0);
                setStatus("Idle");
                setResponse(null);
              }}
              className="bg-transparent border border-slate-700 px-4 py-2 rounded-lg"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 text-sm text-slate-300">
            <div>Status: <span className="font-mono text-amber-200">{status}</span></div>

            <div className="mt-3">
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${uploadPct}%` }}
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all"
                />
              </div>
              <div className="mt-1 text-xs text-slate-400">{uploadPct}%</div>
            </div>
          </div>

          {response && (
            <pre className="mt-4 p-3 bg-black/60 text-xs rounded max-h-40 overflow-auto text-emerald-200">
              {JSON.stringify(response, null, 2)}
            </pre>
          )}
        </div>

        {/* Right: 3D Brain */}
        <div
          className="h-72 rounded-lg bg-gradient-to-br from-slate-800/40 to-indigo-900/30 p-2"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            {/* lights */}
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            {/* if training, increase emissive color by changing material via hovered prop */}
            <Brain hovered={isTraining || hovered} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={isTraining ? 1.5 : 0.6} />
          </Canvas>

          {/* overlay indicator */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isTraining ? "bg-emerald-400 animate-pulse" : "bg-slate-500"}`}></div>
            <div className="text-xs text-slate-300">
              {isTraining ? "Training in progress — the brain is learning…" : "Idle / Ready"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
