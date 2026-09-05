import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Image as ImageIcon, X, FileText, AlignLeft, ShieldAlert } from 'lucide-react';
import Detector from '../components/Detector';
import axios from 'axios';
import { INITIAL_HISTORY } from './Dashboard';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
    e.currentTarget.style.borderColor = '#0066FF';
    e.currentTarget.style.background = 'rgba(0, 102, 255, 0.08)';
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)';
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.65)';
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
    const startTime = Date.now();
    
    try {
      let response;
      if (activeTab === 'image' || activeTab === 'video') {
        const formData = new FormData();
        formData.append('file', file);
        response = await axios.post(`${API_BASE_URL}/api/detect`, formData);

        // Upload the scanned file to Supabase Storage if configured (non-blocking)
        if (file && isSupabaseConfigured) {
          try {
            const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filePath = `${Date.now()}-${safeFileName}`;

            const { error: uploadError } = await supabase.storage
              .from('deepfake-files')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || undefined,
              });

            if (uploadError) {
              console.warn('Supabase Storage upload warning:', uploadError.message);
            } else {
              console.log('File uploaded to Supabase Storage:', filePath);
            }
          } catch (storageErr) {
            console.warn('Supabase Storage upload exception:', storageErr);
          }
        }
      } else {
        response = await axios.post(`${API_BASE_URL}/api/detect-text`, { text: textInput }, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      const elapsed = Date.now() - startTime;
      const minAnimationTime = 3000;
      const remainingTime = Math.max(0, minAnimationTime - elapsed);

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
        
      }, remainingTime);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'An error occurred during verification.');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-overlay" />

      <div className="page-content animate-slide-up" style={{ maxWidth: '940px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
              background: 'rgba(0, 102, 255, 0.12)', 
              padding: '1rem', 
              borderRadius: '50%', 
              boxShadow: '0 8px 25px rgba(0, 102, 255, 0.2)',
              border: '1px solid rgba(0, 102, 255, 0.2)'
            }}>
              <ShieldAlert size={36} color="#0066FF" />
            </div>
          </div>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.03em', color: '#0b1329', textShadow: '0 1px 3px rgba(255, 255, 255, 0.9)' }}>
            Detection Hub
          </h2>
          <p style={{ color: '#334155', fontSize: '1.05rem', fontWeight: 600 }}>
            Deepfake & AI Authenticity Analysis powered by Vision Transformer (ViT) ML
          </p>
        </div>

        {status === 'idle' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button 
              className="glass-nav-pill"
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '100px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === 'image' ? '#0066FF' : 'rgba(255, 255, 255, 0.75)',
                color: activeTab === 'image' ? '#ffffff' : '#334155',
                boxShadow: activeTab === 'image' ? '0 8px 25px rgba(0, 102, 255, 0.35)' : '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => { setActiveTab('image'); handleReset(); }}
            >
              <ImageIcon size={18} /> Image Scanner
            </button>
            <button 
              className="glass-nav-pill"
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '100px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === 'video' ? '#0066FF' : 'rgba(255, 255, 255, 0.75)',
                color: activeTab === 'video' ? '#ffffff' : '#334155',
                boxShadow: activeTab === 'video' ? '0 8px 25px rgba(0, 102, 255, 0.35)' : '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => { setActiveTab('video'); handleReset(); }}
            >
              <FileVideo size={18} /> Video Scanner
            </button>
            <button 
              className="glass-nav-pill"
              style={{
                padding: '0.75rem 1.6rem',
                borderRadius: '100px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                transition: 'all 0.3s ease',
                backgroundColor: activeTab === 'text' ? '#0066FF' : 'rgba(255, 255, 255, 0.75)',
                color: activeTab === 'text' ? '#ffffff' : '#334155',
                boxShadow: activeTab === 'text' ? '0 8px 25px rgba(0, 102, 255, 0.35)' : '0 4px 15px rgba(0, 0, 0, 0.05)'
              }}
              onClick={() => { setActiveTab('text'); handleReset(); }}
            >
              <AlignLeft size={18} /> Text Analyzer
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="animate-slide-up" style={{ margin: '1rem 0 2rem 0', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '16px', color: '#dc2626', textAlign: 'center', fontWeight: '600' }}>
            <span style={{ fontWeight: '800', marginRight: '0.5rem' }}>Error:</span>{errorMsg}
          </div>
        )}

        {status === 'idle' && (activeTab === 'image' || activeTab === 'video') && !file && (
          <div 
            className="page-glass-card"
            style={{
              border: '2px dashed rgba(0, 102, 255, 0.3)',
              padding: '4.5rem 2rem',
              textAlign: 'center',
              cursor: 'pointer',
              borderRadius: '24px',
              transition: 'all 0.3s ease',
              background: 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.06)'
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
            <div style={{ 
              width: '90px', 
              height: '90px', 
              borderRadius: '50%', 
              background: 'rgba(0, 102, 255, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 1.75rem auto',
              border: '1px solid rgba(0, 102, 255, 0.2)'
            }}>
              <UploadCloud size={44} color="#0066FF" />
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.5rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
              Drag & drop {activeTab === 'image' ? 'an Image' : 'a Video'} here
            </h3>
            <p style={{ color: '#475569', fontSize: '1.05rem', fontWeight: 500 }}>
              Accepts {activeTab === 'image' ? '.JPG, .PNG, .WEBP' : '.MP4, .MOV, .AVI, .HEVC'}
            </p>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '1.25rem' }}>
              or <span style={{ color: '#0066FF', fontWeight: '700', textDecoration: 'underline' }}>click to browse</span> from your system
            </p>
          </div>
        )}

        {status === 'idle' && activeTab === 'text' && (
          <div className="page-glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Paste Text Payload
            </h3>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="mono"
              style={{
                width: '100%',
                height: '220px',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                padding: '1.25rem',
                color: '#0f172a',
                resize: 'none',
                marginBottom: '1.75rem',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.04)',
                outline: 'none'
              }}
              placeholder="> Initialize scan sequence...&#10;> Awaiting input string for deep linguistic analysis..."
            />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                className="cta-button-start" 
                style={{ fontSize: '1.05rem', padding: '1rem 3rem', borderRadius: '14px' }} 
                onClick={startDetection} 
                disabled={textInput.length < 10}
              >
                Initiate Analysis Sequence
              </button>
            </div>
          </div>
        )}

        {file && status === 'idle' && (activeTab === 'image' || activeTab === 'video') && (
          <div className="page-glass-card animate-slide-up" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>Target Acquired</h3>
              <button 
                onClick={handleReset} 
                style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  color: '#dc2626', 
                  cursor: 'pointer', 
                  padding: '0.5rem', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  transition: 'all 0.2s' 
                }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ 
              background: '#04070d', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '18px', 
              height: '380px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              overflow: 'hidden', 
              marginBottom: '2rem', 
              boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.5)' 
            }}>
              {file.type.startsWith('video/') ? (
                <video src={preview} controls style={{ maxHeight: '100%', maxWidth: '100%' }} />
              ) : (
                <img src={preview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="cta-button-start" style={{ fontSize: '1.05rem', padding: '1rem 3.5rem', borderRadius: '14px' }} onClick={startDetection}>
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

        {/* Minimal Footer */}
        <footer className="minimal-footer" style={{ marginTop: '3.5rem' }}>
          <span>&copy; 2026 RealNetra. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            A safer digital tomorrow. <span style={{ display: 'inline-block', width: '20px', height: '2px', backgroundColor: 'currentColor', opacity: 0.6 }} />
          </span>
        </footer>
      </div>
    </div>
  );
}