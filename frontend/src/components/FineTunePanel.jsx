import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { motion } from "framer-motion";

export default function FineTunePanel({ onUpload }) {
  const [file, setFile] = useState(null);
  const [hovered, setHovered] = useState(false);

  return (
    <div className="bg-slate-900 p-10 rounded-3xl shadow-2xl text-center relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-30">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <OrbitControls enableZoom={false} autoRotate />
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 3]} intensity={2} />
          <Sphere visible args={[1, 64, 64]} scale={1.6}>
            <MeshDistortMaterial
              color={hovered ? "#fbbf24" : "#38bdf8"}
              attach="material"
              distort={0.4}
              speed={3}
              roughness={0}
            />
          </Sphere>
        </Canvas>
      </div>

      {/* Foreground UI */}
      <div className="relative z-10">
        <motion.h3
          className="text-3xl font-semibold mb-4 text-amber-400 drop-shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Fine-Tune Your Legal AI
        </motion.h3>

        <p className="text-slate-400 mb-6 text-sm">
          Upload a <span className="text-sky-400 font-medium">JSON dataset</span> to train the model.
        </p>

        <motion.input
          type="file"
          accept=".json"
          onChange={(e) => setFile(e.target.files[0])}
          whileHover={{ scale: 1.05 }}
          className="block w-full text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onUpload(file)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
        >
          🚀 Start Fine-Tuning
        </motion.button>

        <p className="mt-4 text-xs text-slate-400 italic">
          Training may take a few minutes depending on dataset size.
        </p>
      </div>
    </div>
  );
}
