import React from "react";
import UploadPanel from "./UploadPanel";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function Hero({ onFile, onTextSubmit }) {
  return (
    <header id="home" className="relative">
      {/* 3D background (decorative) */}
      <div className="absolute inset-0 -z-10 opacity-40">
        <Canvas>
          <Stars radius={100} depth={50} count={5000} factor={4} fade />
        </Canvas>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Simplify Indian <span className="text-amber-300">Law</span> with AI
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl">
            Understand complex legal documents in clear, simple language. Upload
            a document or paste text to get a summary, simplification and
            linked law references.
          </p>

          <div className="mt-8">
            <UploadPanel onFile={onFile} onTextSubmit={onTextSubmit} />
          </div>
        </div>

        <div className="w-full md:w-1/2">
          {/* Illustration placeholder */}
          <div className="rounded-2xl bg-gradient-to-tr from-indigo-900/30 to-slate-800/20 p-6 shadow-xl">
            <img src="/robot-illustration.png" alt="AI robot" className="w-full" />
          </div>
        </div>
      </div>
    </header>
  );
}
