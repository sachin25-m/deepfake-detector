### File: backend/main.py
`
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import time
import random
import asyncio

app = FastAPI(title="Deepfake Detection API")

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Deepfake Detection API Simulation is running."}

@app.post("/api/detect")
async def detect_media(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/") and not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload an image or video.")
    
    # Simulate processing time for realistic UI (wait 3 seconds total but chunked across steps in frontend ideally)
    # The frontend will maintain the stepper. We will just return the simulated result after a delay.
    await asyncio.sleep(2)
    
    # Simulate ML detection outcome
    is_fake = random.choice([True, False])
    confidence = round(random.uniform(70.0, 99.5), 2)
    
    return {
        "filename": file.filename,
        "type": file.content_type,
        "result": "DEEPFAKE" if is_fake else "REAL",
        "confidence": confidence,
        "details": {
            "model_used": "EfficientNet-B4 + LSTM (Simulated)",
            "faces_detected": random.randint(1, 3),
            "artifacts_found": random.randint(5, 20) if is_fake else 0
        }
    }

`

### File: backend/requirements.txt
`
fastapi
uvicorn
python-multipart
# tensorflow # To be added later if deploying real model
# opencv-python # To be added later if deploying real model

`

### File: frontend/src/index.css
`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --bg-dark: #0a0e17;
  --bg-panel: #111827;
  --text-main: #f3f4f6;
  --text-muted: #9ca3af;
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --primary-glow: rgba(59, 130, 246, 0.4);
  --accent: #8b5cf6;
  --accent-glow: rgba(139, 92, 246, 0.4);
  --success: #10b981;
  --danger: #ef4444;
  --danger-glow: rgba(239, 68, 68, 0.4);
  --glass-bg: rgba(17, 24, 39, 0.6);
  --glass-border: rgba(255, 255, 255, 0.08);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-dark);
  color: var(--text-main);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08) 0%, transparent 50%);
  min-height: 100vh;
  overflow-x: hidden;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 1rem;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--accent-glow);
}

.btn-secondary {
  background: transparent;
  color: var(--text-main);
  border: 1px solid var(--glass-border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Animations */
@keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0 var(--primary-glow); }
  70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

.animate-pulse-glow {
  animation: pulseGlow 2s infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.text-gradient {
  background: linear-gradient(to right, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

`

### File: frontend/src/App.jsx
`
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/Home';
import UploadPage from './pages/Upload';
import DashboardPage from './pages/Dashboard';
import AboutPage from './pages/About';

function App() {
  return (
    <Router>
      <Navbar />
      <main className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;

`

### File: frontend/src/components/Navbar.jsx
`
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Upload, Activity, Info } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Detect', icon: Upload },
    { path: '/dashboard', label: 'History', icon: Activity },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="glass-panel" style={{ 
      position: 'fixed', 
      top: '1rem', 
      left: '50%', 
      transform: 'translateX(-50%)',
      width: 'calc(100% - 4rem)',
      maxWidth: '1200px',
      zIndex: 50,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'white' }}>
        <Shield size={28} color="var(--primary)" />
        <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }} className="text-gradient">
          Aegis AI
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: active ? 'white' : 'var(--text-muted)',
                fontWeight: active ? '600' : '400',
                transition: 'color 0.2s',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                paddingBottom: '4px'
              }}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

`

### File: frontend/src/components/Detector.jsx
`
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Database, Search, Cpu, Download } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Preprocessing Media', icon: Database, duration: 1500 },
  { id: 2, label: 'Feature Extraction', icon: Search, duration: 1500 },
  { id: 3, label: 'CNN Model Analysis', icon: Cpu, duration: 1500 }
];

export default function Detector({ file, previewUrl, status, result, resetView }) {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    if (status === 'processing') {
      let timeout1 = setTimeout(() => setActiveStep(2), STEPS[0].duration);
      let timeout2 = setTimeout(() => setActiveStep(3), STEPS[0].duration + STEPS[1].duration);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else if (status === 'complete') {
      setActiveStep(4); // Meaning all steps done
    }
  }, [status]);

  return (
    <div className="glass-panel" style={{ padding: '2rem' }}>
      
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left column: Preview */}
        <div style={{ flex: '1', maxWidth: '300px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {file.type.startsWith('video/') ? (
              <video src={previewUrl} style={{ maxHeight: '100%', maxWidth: '100%' }} />
            ) : (
              <img src={previewUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            )}
          </div>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
            {file.name}
          </p>
        </div>

        {/* Right column: Processing/Results */}
        <div style={{ flex: '2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {status === 'processing' && (
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                Analyzing Media...
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {STEPS.map((step) => {
                  const isPast = activeStep > step.id;
                  const isCurrent = activeStep === step.id;
                  
                  let iconColor = 'var(--text-muted)';
                  if (isPast) iconColor = 'var(--success)';
                  if (isCurrent) iconColor = 'var(--primary)';

                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: isPast || isCurrent ? 1 : 0.4, transition: 'all 0.3s' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: isCurrent ? 'var(--primary-glow)' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: iconColor
                      }}>
                        <step.icon size={16} />
                      </div>
                      <span style={{ fontWeight: isCurrent ? '600' : '400', flex: 1 }}>{step.label}</span>
                      {isPast && <CheckCircle size={18} color="var(--success)" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {status === 'complete' && result && (
            <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
              <div style={{ 
                background: result.result === 'DEEPFAKE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${result.result === 'DEEPFAKE' ? 'var(--danger)' : 'var(--success)'}`,
                padding: '2rem', 
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                {result.result === 'DEEPFAKE' ? (
                  <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
                ) : (
                  <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 1rem auto' }} />
                )}
                <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', color: result.result === 'DEEPFAKE' ? 'var(--danger)' : 'var(--success)' }}>
                  {result.result}
                </h2>
                <p style={{ fontSize: '1.25rem' }}>Confidence: <strong style={{color: 'white'}}>{result.confidence}%</strong></p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Model Used</p>
                  <p style={{ fontWeight: '500' }}>{result.details.model_used}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Artifacts Detected</p>
                  <p style={{ fontWeight: '500' }}>{result.details.artifacts_found}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={resetView}>Analyze Another</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => alert('Report download simulated!')}>
                  <Download size={18} /> Download Report
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

`

### File: frontend/src/pages/Home.jsx
`
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Image as ImageIcon, AlertTriangle } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: '80vh', justifyContent: 'center' }}>
      <div style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.5rem', 
        padding: '0.5rem 1rem', 
        background: 'rgba(59, 130, 246, 0.1)', 
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '999px',
        color: 'var(--primary)',
        fontWeight: '500',
        marginBottom: '2rem'
      }}>
        <ShieldCheck size={18} />
        Advanced AI Detection Engine
      </div>
      
      <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', maxWidth: '800px' }}>
        Unmask the Truth with <span className="text-gradient">Deepfake Detection</span>
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
        In an era of digital manipulation, trust is earned. Our state-of-the-art CNN-based analysis scans facial features and pixel patterns to determine whether media is REAL or DEEPFAKE.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
        <button className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }} onClick={() => navigate('/upload')}>
          Upload Media to Detect
        </button>
        <button className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }} onClick={() => navigate('/about')}>
          Learn How It Works
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <FeatureCard 
          icon={<Video size={24} color="var(--primary)" />} 
          title="Video Analysis" 
          desc="Frame-by-frame temporal consistency checks to catch subtle deepfakes."
        />
        <FeatureCard 
          icon={<ImageIcon size={24} color="var(--accent)" />} 
          title="Image Forensics" 
          desc="Highlighting pixel inconsistencies and AI-generated blending artifacts."
        />
        <FeatureCard 
          icon={<AlertTriangle size={24} color="var(--danger)" />} 
          title="Risk Mitigation" 
          desc="Protect yourself against misinformation, cybercrime, and identity theft."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-panel" style={{ 
      padding: '2rem', 
      textAlign: 'left', 
      width: '300px',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ 
        width: '48px', height: '48px', 
        borderRadius: '12px', 
        background: 'rgba(255,255,255,0.05)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{desc}</p>
    </div>
  );
}

`

### File: frontend/src/pages/Upload.jsx
`
import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Image as ImageIcon, X } from 'lucide-react';
import Detector from '../components/Detector';
import axios from 'axios';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, complete, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile) => {
    if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
      setErrorMsg('Please upload a valid image or video file.');
      return;
    }
    setErrorMsg('');
    setFile(selectedFile);
    setStatus('idle');
    setResult(null);

    // Create preview
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setResult(null);
    setErrorMsg('');
  };

  const startDetection = async () => {
    if (!file) return;
    setStatus('processing');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Assuming FastAPI is running on port 8000 locally
      const response = await axios.post('http://127.0.0.1:8000/api/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Delay to allow frontend stepper to complete for aesthetics
      setTimeout(() => {
        setResult(response.data);
        setStatus('complete');
      }, 4500); // 4.5 seconds for dramatic effect!

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || 'An error occurred during detection.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>AI Media Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Upload an image or video to determine authenticity</p>
      </div>

      {status === 'idle' && !file && (
        <div 
          className="glass-panel"
          style={{
            border: '2px dashed var(--primary)',
            padding: '4rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: 'var(--glass-bg)'
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
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
            accept="image/*,video/*"
          />
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <UploadCloud size={40} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Drag & drop media here</h3>
          <p style={{ color: 'var(--text-muted)' }}>or click to browse from your computer</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2rem' }}>Supports JPG, PNG, MP4, WEBM up to 50MB</p>
        </div>
      )}

      {errorMsg && (
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      {file && status === 'idle' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Selected Media</h3>
            <button onClick={handleRemoveFile} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '2rem' }}>
            {file.type.startsWith('video/') ? (
              <video src={preview} controls style={{ maxHeight: '100%', maxWidth: '100%' }} />
            ) : (
              <img src={preview} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-primary animate-pulse-glow" style={{ fontSize: '1.25rem', padding: '1rem 3rem' }} onClick={startDetection}>
              Run Detection Analysis
            </button>
          </div>
        </div>
      )}

      {(status === 'processing' || status === 'complete') && (
        <Detector file={file} previewUrl={preview} status={status} result={result} resetView={handleRemoveFile} />
      )}
    </div>
  );
}

`

### File: frontend/src/pages/Dashboard.jsx
`
import React from 'react';
import { Activity, ShieldAlert, ShieldCheck } from 'lucide-react';

const MOCK_HISTORY = [
  { id: 1, date: '2026-04-09 10:23', name: 'video_interview.mp4', result: 'DEEPFAKE', confidence: 94.2 },
  { id: 2, date: '2026-04-09 09:15', name: 'profile_pic.png', result: 'REAL', confidence: 99.1 },
  { id: 3, date: '2026-04-08 16:45', name: 'political_speech.mp4', result: 'DEEPFAKE', confidence: 88.5 },
  { id: 4, date: '2026-04-08 11:30', name: 'event_photo.jpg', result: 'REAL', confidence: 95.8 },
];

export default function Dashboard() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '2rem' }}>Analysis Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color="var(--primary)" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Analyzed</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>128</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={32} color="var(--danger)" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deepfakes Detected</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>34</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldCheck size={32} color="var(--success)" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authentic Media</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>94</h3>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h3>
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>File Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Confidence</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_HISTORY.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: idx !== MOCK_HISTORY.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.date}</td>
                <td style={{ padding: '1rem' }}>{item.name}</td>
                <td style={{ padding: '1rem' }}>{item.confidence}%</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    background: item.result === 'DEEPFAKE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: item.result === 'DEEPFAKE' ? 'var(--danger)' : 'var(--success)'
                  }}>
                    {item.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

`

### File: frontend/src/pages/About.jsx
`
import React from 'react';
import { Network, Database as DatabaseIcon, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>How Aegis AI Works</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Understanding the technology behind modern deepfake detection.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Network size={32} color="var(--primary)" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Convolutional Neural Networks (CNNs)</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
          Our core architecture relies on CNNs, specifically variants of EfficientNet and custom LSTM modules, designed to analyze both spatial inconsistency within a single frame and temporal inconsistency across multiple frames in a video.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Deepfakes leave microscopic traces—blurry boundaries, unnatural blinking, inconsistent lighting, and compression artifacts that human eyes often miss. Our models highlight these pixel-perfect discrepancies.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <DatabaseIcon size={32} color="var(--accent)" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Training Datasets</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Aegis AI has been validated using industry-standard datasets to ensure robust detection against multiple generation techniques:
        </p>
        <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)', lineHeight: 1.7, marginTop: '1rem' }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>FaceForensics++</strong>: Extensive dataset of manipulated facial videos.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Deepfake Detection Challenge (DFDC)</strong>: Highly complex scenarios with varied lighting and obstructions.</li>
          <li><strong>Celeb-DF</strong>: High-quality manipulated sequences generated using advanced autoencoders.</li>
        </ul>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Cpu size={32} color="var(--success)" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>System Architecture</h3>
        </div>
        <div style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <ol style={{ paddingLeft: '1.5rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Preprocessing:</strong> Face tracking and extraction from individual frames.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Feature Extraction:</strong> CNN generates deep feature embeddings of the crop.</li>
            <li><strong>Classification:</strong> The sequential features are analyzed, returning a confidence metric of synthetic generation.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

`

