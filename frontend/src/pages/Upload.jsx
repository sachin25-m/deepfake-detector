import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Image as ImageIcon, X, FileText, AlignLeft, ShieldAlert } from 'lucide-react';
import Detector from '../components/Detector';
import axios from 'axios';
import { INITIAL_HISTORY } from './Dashboard';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Upload() {
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'video' or 'text'
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [textInput, setTextInput] = useState('');
  
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--primary)';
    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--glass-border)';
    e.currentTarget.style.background = 'var(--glass-bg)';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'var(--glass-border)';
    e.currentTarget.style.background = 'var(--glass-bg)';
    if ((activeTab === 'image' || activeTab === 'video') && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (activeTab === 'image' && !selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file.');
      return;
    }
    if (activeTab === 'video' && !selectedFile.type.startsWith('video/')) {
      setErrorMsg('Please upload a valid video file.');
      return;
    }
    setErrorMsg('');
    setFile(selectedFile);
    setStatus('idle');
    setResult(null);

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setTextInput('');
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  const startDetection = async () => {
    if ((activeTab === 'image' || activeTab === 'video') && !file) return;
    if (activeTab === 'text' && textInput.length < 10) {
      setErrorMsg('Text must be at least 10 characters long.');
      return;
    }

    setStatus('processing');
    setErrorMsg('');
    
    try {
      let response;
      if (activeTab === 'image' || activeTab === 'video') {
        const formData = new FormData();
        formData.append('file', file);
        response = await axios.post(`${API_BASE_URL}/api/detect`, formData);
      } else {
        response = await axios.post(`${API_BASE_URL}/api/detect-text`, { text: textInput }, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      setTimeout(() => {
        setResult(response.data);
        setStatus('complete');
        
        // Save to history
        const newHistoryItem = {
          id: Date.now(),
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          name: response.data.filename || (activeTab === 'text' ? 'Text Snippet' : 'Unknown File'),
          result: response.data.result,
          confidence: response.data.confidence
        };
        
        const saved = localStorage.getItem('scanHistory');
        let currentHistory = saved !== null ? JSON.parse(saved) : INITIAL_HISTORY;
        
        const updatedHistory = [newHistoryItem, ...currentHistory];
        localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));
        
      }, 4500);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'An error occurred during verification.');
    }
  };

  return (
    <div className="animate-slide-up" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ background: 'rgba(0, 240, 255, 0.1)', padding: '1rem', borderRadius: '50%', boxShadow: '0 0 20px var(--primary-glow)' }}>
            <ShieldAlert size={36} color="var(--primary)" />
          </div>
        </div>
        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>Detection Hub</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Securely scan media files or analyze text for AI generation footprints</p>
      </div>

      {status === 'idle' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn ${activeTab === 'image' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '1rem 1.5rem', borderRadius: '100px' }}
            onClick={() => { setActiveTab('image'); handleReset(); }}
          >
            <ImageIcon size={20} /> Image Scanner
          </button>
          <button 
            className={`btn ${activeTab === 'video' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '1rem 1.5rem', borderRadius: '100px' }}
            onClick={() => { setActiveTab('video'); handleReset(); }}
          >
            <FileVideo size={20} /> Video Scanner
          </button>
          <button 
            className={`btn ${activeTab === 'text' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '1rem 1.5rem', borderRadius: '100px' }}
            onClick={() => { setActiveTab('text'); handleReset(); }}
          >
            <AlignLeft size={20} /> Text Analyzer
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="animate-slide-up" style={{ margin: '1rem 0', padding: '1.25rem', background: 'rgba(255, 0, 60, 0.1)', border: '1px solid var(--danger)', borderRadius: '12px', color: 'var(--text-main)', textAlign: 'center', fontWeight: '500' }}>
          <span style={{ color: 'var(--danger)', marginRight: '0.5rem' }}>Error:</span>{errorMsg}
        </div>
      )}

      {status === 'idle' && (activeTab === 'image' || activeTab === 'video') && !file && (
        <div 
          className="glass-panel"
          style={{
            border: '2px dashed var(--glass-border)',
            padding: '5rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            background: 'var(--glass-bg)'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.boxShadow = '0 0 30px var(--primary-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--glass-border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <input 
            type="file" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelected(e.target.files[0]);
              }
            }}
            accept={activeTab === 'image' ? "image/*" : "video/*"}
          />
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(112, 0, 255, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem auto', border: '1px solid rgba(255,255,255,0.05)' }}>
            <UploadCloud size={48} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Drag & drop {activeTab === 'image' ? 'an Image' : 'a Video'} here</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Accepts {activeTab === 'image' ? '.JPG, .PNG, .WEBP' : '.MP4, .MOV, .AVI, .HEVC'}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>or <span className="text-gradient" style={{cursor: 'pointer', fontWeight: '600'}}>click to browse</span> from your system</p>
        </div>
      )}

      {status === 'idle' && activeTab === 'text' && (
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Paste Text Payload</h3>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="mono"
            style={{
              width: '100%',
              height: '250px',
              background: 'var(--bg-panel)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              color: 'var(--text-main)',
              resize: 'none',
              marginBottom: '2rem',
              fontSize: '1rem',
              lineHeight: 1.6,
              boxShadow: 'inset 0 4px 20px var(--glass-border)',
              transition: 'border-color 0.3s'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--glass-border)'}
            placeholder="> Initialize scan sequence...&#10;> Awaiting input string for deep linguistic analysis..."
          ></textarea>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-primary animate-pulse-glow" style={{ fontSize: '1.125rem', padding: '1.25rem 3rem', borderRadius: '16px' }} onClick={startDetection} disabled={textInput.length < 10}>
              Initiate Analysis Sequence
            </button>
          </div>
        </div>
      )}

      {file && status === 'idle' && (activeTab === 'image' || activeTab === 'video') && (
        <div className="glass-panel animate-slide-up" style={{ padding: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Target Acquired</h3>
            <button onClick={handleReset} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 0, 60, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
              <X size={20} />
            </button>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--glass-border)', borderRadius: '16px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '2.5rem', boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)' }}>
            {file.type.startsWith('video/') ? (
              <video src={preview} controls style={{ maxHeight: '100%', maxWidth: '100%' }} />
            ) : (
              <img src={preview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-primary animate-pulse-glow" style={{ fontSize: '1.125rem', padding: '1.25rem 4rem', borderRadius: '16px' }} onClick={startDetection}>
              Run Neural Scan
            </button>
          </div>
        </div>
      )}

      {(status === 'processing' || status === 'complete') && (
        <Detector 
          file={file} 
          previewUrl={preview} 
          textSnippet={textInput}
          mode={activeTab === 'text' ? 'text' : 'media'}
          status={status} 
          result={result} 
          resetView={handleReset} 
        />
      )}
    </div>
  );
}
