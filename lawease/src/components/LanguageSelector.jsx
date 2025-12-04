import React from "react";

export default function LanguageSelector({ lang, setLang }) {
  const langs = [
    { code: "en_XX", label: "English" },
    { code: "hi_IN", label: "Hindi" },
    { code: "ta_IN", label: "Tamil" },
    { code: "kn_IN", label: "Kannada" },
  ];

  return (
    <select
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2"
    >
      {langs.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
