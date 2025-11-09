import React, { useState } from 'react';
import FileUpload from './FileUpload';
import TextInput from './TextInput';
import ResultsDisplay from './ResultsDisplay';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const { user } = useAuth();

  const handleResults = (data) => {
    setResults(data);
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to Legal Simplifier, {user?.username}!</h1>
        <p>Upload legal documents or paste text to get AI-powered summaries and simplifications</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'upload' ? 'tab-active' : ''}
          onClick={() => setActiveTab('upload')}
        >
          📁 Upload Document
        </button>
        <button 
          className={activeTab === 'text' ? 'tab-active' : ''}
          onClick={() => setActiveTab('text')}
        >
          📝 Paste Text
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'upload' && (
          <FileUpload 
            onResults={handleResults} 
            onLoading={handleLoading}
          />
        )}
        {activeTab === 'text' && (
          <TextInput 
            onResults={handleResults} 
            onLoading={handleLoading}
          />
        )}
        
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing your legal document...</p>
          </div>
        )}

        {results && !loading && (
          <ResultsDisplay results={results} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
