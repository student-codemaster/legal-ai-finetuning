import React from "react";

export default function ResultCard({ result }) {
  if (!result) return null;

  return (
    <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Detected Language */}
      {result.detected_language && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Detected Language
          </h3>
          <p className="text-gray-300 bg-gray-900 p-2 rounded">
            {result.detected_language}
          </p>
        </div>
      )}

      {/* Articles Found */}
      {result.articles_found && result.articles_found.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Articles Found ({result.articles_found.length})
          </h3>
          <div className="bg-gray-900 p-4 rounded max-h-32 overflow-y-auto">
            {result.articles_found.map((article, idx) => (
              <div key={idx} className="text-gray-300 mb-1">
                • {article.substring(0, 100)}...
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {result.summary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            📝 Summary
          </h3>
          <div className="bg-gray-900 p-4 rounded text-gray-200 max-h-40 overflow-y-auto">
            {result.summary}
          </div>
        </div>
      )}

      {/* Simplified Text */}
      {result.simplified && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-purple-400 mb-2">
            ✨ Simplified Version
          </h3>
          <div className="bg-gray-900 p-4 rounded text-gray-200 max-h-40 overflow-y-auto">
            {result.simplified}
          </div>
        </div>
      )}

      {/* Law Details */}
      {result.law_details && Object.keys(result.law_details).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            ⚖️ Related Laws
          </h3>
          <div className="bg-gray-900 p-4 rounded max-h-40 overflow-y-auto">
            {Object.entries(result.law_details).map(([law, details], idx) => (
              <div key={idx} className="mb-3 text-gray-300">
                <strong className="text-yellow-300">{law}</strong>
                <p className="text-sm mt-1">
                  {typeof details === "object"
                    ? JSON.stringify(details).substring(0, 150)
                    : String(details).substring(0, 150)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Download / Copy Button (Optional) */}
      <button
        onClick={() => {
          const text = `Summary:\n${result.summary}\n\nSimplified:\n${result.simplified}`;
          navigator.clipboard.writeText(text);
          alert("Results copied to clipboard!");
        }}
        className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded"
      >
        📋 Copy Results
      </button>
    </div>
  );
}
