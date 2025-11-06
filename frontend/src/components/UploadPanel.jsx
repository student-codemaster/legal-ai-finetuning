import React, { useState } from "react";
import { motion } from "framer-motion";

export default function UploadPanel({ onFile, onTextSubmit }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  const submitFile = () => {
    if (!file) return alert("Please choose a file");
    onFile(file);
  };

  return (
    <motion.div initial={{y:10, opacity:0}} animate={{y:0,opacity:1}} className="bg-white/6 backdrop-blur-md p-6 rounded-2xl max-w-2xl">
      <div className="border-2 border-dashed border-white/10 p-6 rounded-lg">
        <label className="block cursor-pointer">
          <input
            type="file"
            accept=".pdf,.docx,.doc"
            onChange={(e) => setFile(e.target.files[0])}
            className="hidden"
          />
          <div className="text-left">
            <div className="font-semibold text-lg">Drop your document here or click to upload</div>
            <div className="text-sm text-slate-300 mt-2">{file ? file.name : "PDF / DOCX"}</div>
          </div>
        </label>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={submitFile} className="bg-amber-400 text-slate-900 px-4 py-2 rounded-lg font-semibold">
          Try Simplifier Now
        </button>

        <button
          onClick={() => {
            if (!text.trim()) return alert("Enter text first");
            onTextSubmit(text);
          }}
          className="bg-transparent border border-white/20 px-4 py-2 rounded-lg"
        >
          Analyze Text
        </button>
      </div>

      <textarea
        placeholder="Or paste text here..."
        className="mt-4 w-full p-3 rounded-lg bg-white/5 text-white"
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </motion.div>
  );
}
