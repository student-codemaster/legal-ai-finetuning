import React, { useState } from 'react';
import { legalAPI } from '../../services/api';
import LanguageSelector from './LanguageSelector';
import './TextInput.css';

const TextInput = ({ onResults, onLoading }) => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('auto');

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some legal text');
      return;
    }

    onLoading(true);
    try {
      const results = await legalAPI.processText(text, language);
      onResults(results);
    } catch (error) {
      console.error('Text processing error:', error);
      alert('Error processing text: ' + (error.response?.data?.detail || error.message));
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="text-input">
      <div className="text-input-header">
        <h3>Paste Legal Text</h3>
        <p>Enter legal text directly for summarization and simplification</p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your legal text here... (e.g., contract clauses, legal documents, court judgments)"
        className="text-area"
        rows="12"
      />

      <div className="text-info">
        <span>{text.length} characters</span>
        {text.length > 10000 && (
          <span className="warning">⚠️ Large text may take longer to process</span>
        )}
      </div>

      <LanguageSelector value={language} onChange={setLanguage} />

      <button 
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="process-button"
      >
        Process Text
      </button>
    </div>
  );
};

export default TextInput;