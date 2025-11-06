import React, { useState } from "react";

export default function TextPanel({ onSubmit }) {
  const [text, setText] = useState("");
  return (
    <div className="p-6 bg-white/5 rounded-2xl">
      <textarea className="w-full p-3 bg-transparent" rows={8} value={text} onChange={(e)=>setText(e.target.value)} />
      <div className="mt-3 flex justify-end">
        <button onClick={()=>onSubmit(text)} className="bg-indigo-600 px-4 py-2 rounded">Process</button>
      </div>
    </div>
  );
}
