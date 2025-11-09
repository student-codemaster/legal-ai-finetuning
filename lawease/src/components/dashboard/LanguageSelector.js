import React from 'react';
import './LanguageSelector.css';

const LanguageSelector = ({ value, onChange }) => {
  const languages = [
    { value: 'auto', label: 'Auto Detect' },
    { value: 'en_XX', label: 'English' },
    { value: 'hi_IN', label: 'Hindi' },
    { value: 'ta_IN', label: 'Tamil' },
    { value: 'kn_IN', label: 'Kannada' }
  ];

  return (
    <div className="language-selector">
      <label htmlFor="language">Output Language:</label>
      <select 
        id="language"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="language-dropdown"
      >
        {languages.map(lang => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;