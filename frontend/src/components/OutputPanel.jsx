import React from "react";

export default function OutputPanel({ result }) {
  if (!result) return null;
  const laws = result.law_details || {};
  return (
    <div className="mt-8 bg-white/5 p-6 rounded-2xl max-w-4xl mx-auto text-left">
      <h2 className="text-2xl font-bold mb-3">Summary</h2>
      <p className="text-slate-200 mb-4">{result.summary}</p>

      <h3 className="text-xl font-semibold mb-2">Simplified</h3>
      <p className="text-slate-200 mb-4">{result.simplified}</p>

      <h3 className="text-xl font-semibold mb-2">Linked Laws</h3>
      <ul className="list-disc pl-5 text-slate-200">
        {Object.entries(laws).map(([k, v]) => (
          <li key={k}>
            <strong className="text-amber-300">{k}</strong>: {v.description || v}
            <span className="ml-2 text-xs text-slate-400">({v.match_type || "n/a"})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
