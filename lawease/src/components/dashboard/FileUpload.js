import React, { useState } from 'react';
import { legalAPI } from '../../services/api';
import LanguageSelector from './LanguageSelector';
import './FileUpload.css';

const FileUpload = ({ onResults, onLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [language, setLanguage] = useState('auto');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (this.validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && this.validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      alert('Please select a PDF or DOCX file');
      return false;
    }
    
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    onLoading(true);
    try {
      const results = await legalAPI.processFile(selectedFile, language);
      onResults(results);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing file: ' + (error.response?.data?.detail || error.message));
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="file-upload">
      <div 
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">📄</div>
          <h3>Upload Legal Document</h3>
          <p>Drag & drop a PDF or DOCX file here, or click to browse</p>
          <input 
            type="file" 
            accept=".pdf,.docx" 
            onChange={handleFileSelect}
            className="file-input"
          />
        </div>
      </div>

      {selectedFile && (
        <div className="file-info">
          <p>Selected: <strong>{selectedFile.name}</strong></p>
          <p>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <LanguageSelector value={language} onChange={setLanguage} />

      <button 
        onClick={handleUpload}
        disabled={!selectedFile}
        className="upload-button"
      >
        Process Document
      </button>
    </div>
  );
};

export default FileUpload;