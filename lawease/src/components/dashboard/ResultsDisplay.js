import React, { useState } from 'react';
import './ResultsDisplay.css';

const ResultsDisplay = ({ results }) => {
  const [activeTab, setActiveTab] = useState('summary');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const downloadAsText = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="results-display">
      <div className="results-header">
        <h2>Processing Results</h2>
        <div className="language-badge">
          Detected Language: {results.detected_language}
        </div>
      </div>

      <div className="results-tabs">
        <button 
          className={activeTab === 'summary' ? 'tab-active' : ''}
          onClick={() => setActiveTab('summary')}
        >
          📄 Summary
        </button>
        <button 
          className={activeTab === 'simplified' ? 'tab-active' : ''}
          onClick={() => setActiveTab('simplified')}
        >
          🔍 Simplified
        </button>
        <button 
          className={activeTab === 'laws' ? 'tab-active' : ''}
          onClick={() => setActiveTab('laws')}
        >
          ⚖️ Related Laws
        </button>
        <button 
          className={activeTab === 'articles' ? 'tab-active' : ''}
          onClick={() => setActiveTab('articles')}
        >
          📊 Articles Found
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3>AI Summary</h3>
              <div className="action-buttons">
                <button onClick={() => copyToClipboard(results.summary)}>
                  📋 Copy
                </button>
                <button onClick={() => downloadAsText(results.summary, 'legal-summary.txt')}>
                  💾 Download
                </button>
              </div>
            </div>
            <div className="content-box">
              <p>{results.summary}</p>
            </div>
          </div>
        )}

        {activeTab === 'simplified' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3>Simplified Legal Text</h3>
              <div className="action-buttons">
                <button onClick={() => copyToClipboard(results.simplified)}>
                  📋 Copy
                </button>
                <button onClick={() => downloadAsText(results.simplified, 'simplified-legal-text.txt')}>
                  💾 Download
                </button>
              </div>
            </div>
            <div className="content-box">
              <p>{results.simplified}</p>
            </div>
          </div>
        )}

        {activeTab === 'laws' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3>Related Laws & References</h3>
            </div>
            <div className="content-box">
              {results.law_details && results.law_details.length > 0 ? (
                <ul className="laws-list">
                  {results.law_details.map((law, index) => (
                    <li key={index} className="law-item">
                      <strong>{law.law_ref}</strong>: {law.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No specific laws detected in the text.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="tab-pane">
            <div className="pane-header">
              <h3>Extracted Legal Articles</h3>
            </div>
            <div className="content-box">
              {results.articles_found && results.articles_found.length > 0 ? (
                <ul className="articles-list">
                  {results.articles_found.map((article, index) => (
                    <li key={index} className="article-item">
                      {article}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No specific legal articles detected.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsDisplay;