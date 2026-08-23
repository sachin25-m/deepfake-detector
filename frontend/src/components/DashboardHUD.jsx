import React, { useEffect, useRef, useState } from 'react';
import { Search, Bell, User, Minus, Square, X, Activity, ShieldAlert, ShieldCheck, Cpu, Radio, Layers, RefreshCw, Sliders, Zap } from 'lucide-react';

export default function DashboardHUD() {
  const [activeTab, setActiveTab] = useState('wireframe'); // 'wireframe', 'surveillance', 'heatmap', 'analytics'
  const [currentTime, setCurrentTime] = useState('12:30:45 AM');
  const waveCanvasRef = useRef(null);
  const faceCanvasRef = useRef(null);
  const fftCanvasRef = useRef(null);

  // Live Clock Ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Left Card 1: Live Waveform Canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;

    const render = () => {
      offset += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width, h = canvas.height;

      // Draw grid
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }

      // Draw Cyan Waveform Line
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      for (let x = 0; x <= w; x += 3) {
        const norm = x / w;
        const y = h / 2 + Math.sin(norm * Math.PI * 6 + offset) * 18 + Math.cos(norm * Math.PI * 12 - offset) * 8;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Center Primary Visualizer: 3D Face Wireframe + Laser Sweep Canvas
  useEffect(() => {
    const canvas = faceCanvasRef.current;
    if (!canvas || activeTab !== 'wireframe') return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 500;
      canvas.height = 360;
    };
    resize();

    // 3D Face Points Definition
    const facePoints = [];
    for (let i = 0; i < 36; i++) {
      const a = (i / 36) * Math.PI * 2;
      facePoints.push({ x: 0.62 * Math.cos(a), y: 0.88 * Math.sin(a), z: 0.2 * Math.cos(a), type: 'contour' });
    }
    // Eyes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      facePoints.push({ x: -0.25 + 0.11 * Math.cos(a), y: -0.2 + 0.08 * Math.sin(a), z: 0.25, type: 'eye' });
      facePoints.push({ x: 0.25 + 0.11 * Math.cos(a), y: -0.2 + 0.08 * Math.sin(a), z: 0.25, type: 'eye' });
    }
    // Nose
    facePoints.push({ x: 0, y: -0.15, z: 0.36, type: 'nose' });
    facePoints.push({ x: 0, y: 0.05, z: 0.46, type: 'nose' });
    facePoints.push({ x: -0.08, y: 0.12, z: 0.38, type: 'nose' });
    facePoints.push({ x: 0.08, y: 0.12, z: 0.38, type: 'nose' });
    // Mouth
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      facePoints.push({ x: 0.2 * Math.cos(a), y: 0.4 + 0.09 * Math.sin(a), z: 0.3, type: 'mouth' });
    }

    let laserY = -1.1;
    let laserDir = 1;
    let time = 0;

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width, h = canvas.height;
      const cx = w / 2, cy = h / 2;
      const scale = Math.min(w, h) * 0.48;

      const rotY = Math.sin(time * 0.4) * 0.22;
      const rotX = Math.cos(time * 0.3) * 0.08;

      laserY += 0.012 * laserDir;
      if (laserY > 1.1) laserDir = -1;
      if (laserY < -1.1) laserDir = 1;

      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

      const projected = facePoints.map(p => {
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;
        const perspective = 3.5 / (3.5 + z2);
        return {
          px: cx + x1 * scale * perspective,
          py: cy + y2 * scale * perspective,
          origY: p.y,
          type: p.type
        };
      });

      // 1. Draw Thermal Heatmap Patch over Cheek / Forehead
      const thermalGrad = ctx.createRadialGradient(cx + 30, cy - 25, 5, cx + 30, cy - 25, 60);
      thermalGrad.addColorStop(0, 'rgba(255, 230, 0, 0.85)');
      thermalGrad.addColorStop(0.3, 'rgba(255, 0, 60, 0.75)');
      thermalGrad.addColorStop(0.65, 'rgba(139, 92, 246, 0.45)');
      thermalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = thermalGrad;
      ctx.beginPath();
      ctx.arc(cx + 30, cy - 25, 60, 0, Math.PI * 2);
      ctx.fill();

      // 2. Wireframe Connectors
      ctx.lineWidth = 0.85;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i], p2 = projected[j];
          const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);
          if (dist < scale * 0.24) {
            const alpha = (1 - dist / (scale * 0.24)) * 0.35;
            const isNearLaser = Math.abs(p1.origY - laserY) < 0.14;
            ctx.strokeStyle = isNearLaser ? `rgba(16, 185, 129, ${alpha * 2.2})` : `rgba(0, 240, 255, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // 3. Facial Landmark Points & Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const isNearLaser = Math.abs(p.origY - laserY) < 0.12;
        ctx.fillStyle = isNearLaser ? '#10b981' : '#00f0ff';
        ctx.beginPath();
        ctx.arc(p.px, p.py, isNearLaser ? 3.5 : 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Vertical Laser Scanning Beam Sweep
      const laserScreenY = cy + laserY * scale;
      const laserGrad = ctx.createLinearGradient(cx - scale * 0.9, laserScreenY, cx + scale * 0.9, laserScreenY);
      laserGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      laserGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.4)');
      laserGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.95)');
      laserGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
      laserGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.9, laserScreenY);
      ctx.lineTo(cx + scale * 0.9, laserScreenY);
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeTab]);

  return (
    <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', padding: '0.5rem 0' }} className="animate-slide-up">

      {/* 2. Main Dashboard Grid (3 Columns: 30% - 40% - 30%) */}
      <div style={{ display: 'grid', gridTemplateColumns: '30% 40% 30%', gap: '1.25rem', marginBottom: '1.25rem' }}>
        
        {/* ==================== LEFT COLUMN (30%) ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card 1: Live Waveform Chart */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                LIVE SIGNAL WAVEFORM
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
                128 Hz
              </span>
            </div>
            <div style={{ background: '#030610', borderRadius: '8px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
              <canvas ref={waveCanvasRef} width={260} height={100} style={{ width: '100%', height: '100px', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }} className="mono">
              <span>AMPLITUDE: 0.94</span>
              <span>NOISE: 0.02%</span>
            </div>
          </div>

          {/* Card 2: Confidence Line Graph */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                CONFIDENCE SCORE TRAJECTORY
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--danger)', fontWeight: 700 }}>
                94.2% DEEPFAKE
              </span>
            </div>
            <div style={{ background: '#030610', borderRadius: '8px', border: '1px solid var(--glass-border)', height: '100px', position: 'relative', overflow: 'hidden', padding: '0.5rem' }}>
              <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none">
                <path d="M0,60 Q30,50 60,30 T120,40 T180,15 L200,10 L200,80 L0,80 Z" fill="rgba(0, 240, 255, 0.12)" />
                <path d="M0,60 Q30,50 60,30 T120,40 T180,15 L200,10" fill="none" stroke="#00f0ff" strokeWidth="2" />
                <circle cx="180" cy="15" r="4" fill="#ff003c" />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }} className="mono">
              <span>THRESHOLD: 50.0%</span>
              <span>DEV: +44.2%</span>
            </div>
          </div>

          {/* Card 3: FFT Frequency Analysis Graph */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                2D FFT FREQUENCY DENSITY
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700 }}>
                GRID SPIKE DETECTED
              </span>
            </div>
            <div style={{ background: '#030610', borderRadius: '8px', border: '1px solid var(--glass-border)', height: '90px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '0.5rem' }}>
              {[25, 35, 45, 30, 20, 65, 95, 85, 40, 30, 50, 75, 90, 45, 25, 20, 35, 60].map((h, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${h}%`,
                  background: h > 80 ? 'linear-gradient(to top, #ff003c, #ff7800)' : 'linear-gradient(to top, #00f0ff, #2563eb)',
                  borderRadius: '2px'
                }} />
              ))}
            </div>
          </div>

        </div>

        {/* ==================== CENTER COLUMN (40%) ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Primary Facial Analysis Panel */}
          <div className="glass-panel" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            
            {/* Header & Mode Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff003c', boxShadow: '0 0 10px #ff003c' }} className="animate-rec-pulse" />
                <span className="font-orbitron" style={{ fontSize: '0.9rem', fontWeight: 800 }}>PRIMARY FORENSIC MONITOR</span>
              </div>

              {/* 4 Mode Tabs */}
              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '6px', border: '1px solid var(--glass-border)' }}>
                <button className={`btn ${activeTab === 'wireframe' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px' }} onClick={() => setActiveTab('wireframe')}>3D Mesh</button>
                <button className={`btn ${activeTab === 'surveillance' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px' }} onClick={() => setActiveTab('surveillance')}>2x2 Cam</button>
                <button className={`btn ${activeTab === 'heatmap' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px' }} onClick={() => setActiveTab('heatmap')}>Heatmap</button>
                <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem', borderRadius: '4px' }} onClick={() => setActiveTab('analytics')}>Analytics</button>
              </div>
            </div>

            {/* Screen Container */}
            <div style={{
              background: '#020409',
              border: '1px solid var(--glass-border)',
              borderRadius: '10px',
              flex: 1,
              minHeight: '360px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>

              {/* Mode 1: 3D Wireframe Face Scan */}
              {activeTab === 'wireframe' && (
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <canvas ref={faceCanvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.8)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.72rem' }} className="mono">
                    3D MESO_MESH // 68 LANDMARK NODES
                  </div>
                  <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255, 0, 60, 0.25)', padding: '4px 10px', borderRadius: '4px', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 'bold' }} className="mono">
                    TARGET MATCH: DEEPFAKE_SUSPECT
                  </div>
                </div>
              )}

              {/* Mode 2: 2×2 Live Multi-Face Surveillance Grid */}
              {activeTab === 'surveillance' && (
                <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px', padding: '4px' }}>
                  
                  {/* Cam 1 - Deepfake Suspect */}
                  <div style={{ background: '#0a0f1d', border: '1px solid #ff003c', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', color: '#ff003c', fontWeight: 'bold' }} className="mono">CAM_01 // TARGET_A</span>
                    <div style={{ border: '2px stroke #ff003c', width: '90px', height: '100px', borderStyle: 'dashed', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="mono" style={{ background: '#ff003c', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', position: 'absolute', top: -10 }}>FAKE 94.2%</span>
                    </div>
                  </div>

                  {/* Cam 2 - Authentic */}
                  <div style={{ background: '#0a0f1d', border: '1px solid #10b981', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold' }} className="mono">CAM_02 // TARGET_B</span>
                    <div style={{ border: '1.5px solid #10b981', width: '90px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="mono" style={{ background: '#10b981', color: '#000', fontSize: '0.6rem', padding: '1px 4px', position: 'absolute', top: -10, fontWeight: 'bold' }}>REAL 99.1%</span>
                    </div>
                  </div>

                  {/* Cam 3 - Deepfake Suspect */}
                  <div style={{ background: '#0a0f1d', border: '1px solid #ff003c', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', color: '#ff003c', fontWeight: 'bold' }} className="mono">CAM_03 // TARGET_C</span>
                    <div style={{ border: '2px stroke #ff003c', width: '90px', height: '100px', borderStyle: 'dashed', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="mono" style={{ background: '#ff003c', color: '#fff', fontSize: '0.6rem', padding: '1px 4px', position: 'absolute', top: -10 }}>FAKE 91.4%</span>
                    </div>
                  </div>

                  {/* Cam 4 - Authentic */}
                  <div style={{ background: '#0a0f1d', border: '1px solid #10b981', borderRadius: '6px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold' }} className="mono">CAM_04 // TARGET_D</span>
                    <div style={{ border: '1.5px solid #10b981', width: '90px', height: '100px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span className="mono" style={{ background: '#10b981', color: '#000', fontSize: '0.6rem', padding: '1px 4px', position: 'absolute', top: -10, fontWeight: 'bold' }}>REAL 97.8%</span>
                    </div>
                  </div>

                </div>
              )}

              {/* Mode 3: Zoomed Biometric Heatmap */}
              {activeTab === 'heatmap' && (
                <div style={{ width: '100%', height: '100%', position: 'relative', background: 'radial-gradient(circle at 55% 45%, #ff7800 0%, #ff003c 30%, #7000ff 60%, #030610 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ border: '2px dashed #ff003c', width: '180px', height: '220px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '8px' }}>
                    <span className="mono" style={{ background: '#ff003c', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', width: 'fit-content', borderRadius: '4px', fontWeight: 'bold' }}>ANOMALY_ZONE: CHEEK/FOREHEAD</span>
                    <span className="mono" style={{ background: 'rgba(0,0,0,0.8)', color: '#00f0ff', fontSize: '0.7rem', padding: '2px 6px', width: 'fit-content', borderRadius: '4px' }}>INFERNO ELA: 95.4%</span>
                  </div>
                </div>
              )}

              {/* Mode 4: Command Analytics */}
              {activeTab === 'analytics' && (
                <div style={{ width: '100%', height: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                  <h3 className="font-orbitron" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>SYSTEM INFRASTRUCTURE TELEMETRY</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>MesoNet Neural Weight</span>
                      <strong className="mono" style={{ fontSize: '1.2rem', display: 'block', color: 'var(--primary)' }}>0.40 CNN</strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ELA Compression Bias</span>
                      <strong className="mono" style={{ fontSize: '1.2rem', display: 'block', color: '#ff003c' }}>0.35 ELA</strong>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ==================== RIGHT COLUMN (30%) ==================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* 3 Circular Glowing Score Gauges */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
              MULTI-MODAL CONFIDENCE METERS
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
              
              {/* Gauge 1: REAL */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)', marginBottom: '0.4rem' }}>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>99.1%</span>
                </div>
                <span className="mono" style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>REAL</span>
              </div>

              {/* Gauge 2: FAKE */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #ff003c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(255, 0, 60, 0.4)', marginBottom: '0.4rem' }}>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ff003c' }}>94.2%</span>
                </div>
                <span className="mono" style={{ fontSize: '0.65rem', color: '#ff003c', fontWeight: 700 }}>DEEPFAKE</span>
              </div>

              {/* Gauge 3: RISK SCORE */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)', marginBottom: '0.4rem' }}>
                  <span className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f59e0b' }}>96.8%</span>
                </div>
                <span className="mono" style={{ fontSize: '0.65rem', color: '#f59e0b', fontWeight: 700 }}>RISK SCORE</span>
              </div>

            </div>
          </div>

          {/* ELA Analysis Chart */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                ERROR LEVEL ANALYSIS (ELA)
              </span>
              <span className="mono" style={{ fontSize: '0.72rem', color: '#ff003c', fontWeight: 700 }}>
                95.4% SPLICED
              </span>
            </div>
            <div style={{ background: '#030610', borderRadius: '8px', border: '1px solid var(--glass-border)', padding: '0.5rem', height: '70px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: '95.4%', height: '100%', background: 'linear-gradient(90deg, #00f0ff, #ff003c)', boxShadow: '0 0 12px #ff003c' }} />
              </div>
            </div>
          </div>

          {/* Telemetry System Stats */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              SYSTEM TELEMETRY
            </span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }} className="mono">
              <span style={{ color: 'var(--text-muted)' }}>LATENCY:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>1.2 ms</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }} className="mono">
              <span style={{ color: 'var(--text-muted)' }}>FRAME RATE:</span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>60.0 FPS</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }} className="mono">
              <span style={{ color: 'var(--text-muted)' }}>ACCURACY:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 700 }}>99.4%</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Telemetry & Processing Timeline Bar */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block' }} className="mono">SYSTEM FPS</span>
            <strong className="mono" style={{ fontSize: '1.1rem', color: '#10b981' }}>60 FPS</strong>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block' }} className="mono">INFERENCE LATENCY</span>
            <strong className="mono" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>1.2 ms</strong>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block' }} className="mono">MODEL ACCURACY</span>
            <strong className="mono" style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>99.4%</strong>
          </div>
          <div style={{ width: '1px', height: '24px', background: 'var(--glass-border)' }} />
          <div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block' }} className="mono">OVERALL CONFIDENCE</span>
            <strong className="mono" style={{ fontSize: '1.1rem', color: '#ff003c' }}>96.8%</strong>
          </div>
        </div>

        {/* Horizontal Glowing Progress Bar */}
        <div style={{ flex: 1, maxWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }} className="mono">
            <span>PIPELINE BUFFER</span>
            <span>100% READY</span>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #00f0ff, #10b981)', boxShadow: '0 0 10px #00f0ff' }} />
          </div>
        </div>
      </div>

    </div>
  );
}
