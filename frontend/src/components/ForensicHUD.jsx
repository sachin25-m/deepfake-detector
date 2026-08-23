import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldAlert, Cpu, Radio, Eye, Layers } from 'lucide-react';

export default function ForensicHUD() {
  const canvasRef = useRef(null);
  const fftCanvasRef = useRef(null);
  const [timeStr, setTimeStr] = useState('12:30:45 AM');

  // Live time ticker
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3D Face Wireframe & Laser Sweep Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 420;
      canvas.height = 240;
    };
    resize();

    // 3D Face Wireframe Points
    const facePoints = [];
    // Outer Contour Ellipsoid
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      facePoints.push({ x: 0.6 * Math.cos(a), y: 0.85 * Math.sin(a), z: 0.2 * Math.cos(a), type: 'contour' });
    }
    // Eyes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      facePoints.push({ x: -0.25 + 0.1 * Math.cos(a), y: -0.2 + 0.07 * Math.sin(a), z: 0.25, type: 'eye' });
      facePoints.push({ x: 0.25 + 0.1 * Math.cos(a), y: -0.2 + 0.07 * Math.sin(a), z: 0.25, type: 'eye' });
    }
    // Nose
    facePoints.push({ x: 0, y: -0.15, z: 0.35, type: 'nose' });
    facePoints.push({ x: 0, y: 0.05, z: 0.45, type: 'nose' });
    facePoints.push({ x: -0.08, y: 0.12, z: 0.38, type: 'nose' });
    facePoints.push({ x: 0.08, y: 0.12, z: 0.38, type: 'nose' });
    // Mouth
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      facePoints.push({ x: 0.2 * Math.cos(a), y: 0.38 + 0.08 * Math.sin(a), z: 0.3, type: 'mouth' });
    }

    let laserY = -1.1;
    let laserDir = 1;
    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.45;

      const rotY = Math.sin(time * 0.4) * 0.25;
      const rotX = Math.cos(time * 0.3) * 0.1;

      laserY += 0.015 * laserDir;
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
          origX: p.x,
          type: p.type
        };
      });

      // 1. Draw Thermal Heatmap Patch over Cheek / Forehead (Magenta/Crimson/Gold Glow)
      const thermalGrad = ctx.createRadialGradient(cx + 25, cy - 20, 5, cx + 25, cy - 20, 55);
      thermalGrad.addColorStop(0, 'rgba(255, 230, 0, 0.8)');
      thermalGrad.addColorStop(0.3, 'rgba(244, 63, 94, 0.7)');
      thermalGrad.addColorStop(0.65, 'rgba(139, 92, 246, 0.4)');
      thermalGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = thermalGrad;
      ctx.beginPath();
      ctx.arc(cx + 25, cy - 20, 55, 0, Math.PI * 2);
      ctx.fill();

      // 2. Wireframe Mesh Connectors
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i], p2 = projected[j];
          const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);
          if (dist < scale * 0.24) {
            const alpha = (1 - dist / (scale * 0.24)) * 0.35;
            const isNearLaser = Math.abs(p1.origY - laserY) < 0.15;
            ctx.strokeStyle = isNearLaser ? `rgba(16, 185, 129, ${alpha * 2})` : `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // 3. Facial Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const isNearLaser = Math.abs(p.origY - laserY) < 0.12;
        ctx.fillStyle = isNearLaser ? '#10b981' : '#06b6d4';
        ctx.beginPath();
        ctx.arc(p.px, p.py, isNearLaser ? 3.5 : 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Vertical Scanning Laser Beam Sweep
      const laserScreenY = cy + laserY * scale;
      const laserGrad = ctx.createLinearGradient(cx - scale * 0.9, laserScreenY, cx + scale * 0.9, laserScreenY);
      laserGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      laserGrad.addColorStop(0.3, 'rgba(16, 185, 129, 0.4)');
      laserGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.95)');
      laserGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
      laserGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.strokeStyle = laserGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.9, laserScreenY);
      ctx.lineTo(cx + scale * 0.9, laserScreenY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Mini FFT Wave Animation Canvas
  useEffect(() => {
    const canvas = fftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let offset = 0;

    const render = () => {
      offset += 0.06;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      for (let x = 0; x <= w; x += 3) {
        const norm = x / w;
        let y = h / 2 + Math.sin(norm * Math.PI * 6 + offset) * 12;
        if (norm > 0.5 && norm < 0.8) {
          y -= Math.sin((norm - 0.5) * Math.PI * 5) * 18;
        }
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div style={{
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(6, 182, 212, 0.3)',
      borderRadius: '20px',
      padding: '1.25rem',
      boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.8)',
      width: '100%'
    }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} className="animate-rec-pulse" />
          <span className="mono" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', letterSpacing: '0.08em' }}>REC LIVE</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>SYS_ID: RN-9482</span>
        </div>
        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
          {timeStr}
        </div>
      </div>

      {/* Center Visualizer: 3D Wireframe Face & Thermal Scan Sweep */}
      <div style={{
        background: '#02040a',
        border: '1px solid rgba(6, 182, 212, 0.2)',
        borderRadius: '14px',
        height: '240px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '1rem'
      }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

        {/* HUD Target Overlay Labels */}
        <div style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(0,0,0,0.7)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.68rem' }} className="mono">
          SCANNING: MESH_LANDMARKS (68-PT)
        </div>
        <div style={{ position: 'absolute', bottom: 10, right: 12, background: 'rgba(244, 63, 94, 0.2)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: '0.68rem', fontWeight: 600 }} className="mono">
          DEEPFAKE ANOMALY DETECTED
        </div>
      </div>

      {/* Bottom Mini-Visualizer Grid (3 Tiles) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        
        {/* Mini Tile 1: Live 2D FFT Wave Spectrum */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.6rem', position: 'relative' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block', marginBottom: '0.2rem' }} className="mono">2D FFT SPECTRUM</span>
          <canvas ref={fftCanvasRef} width={110} height={40} style={{ width: '100%', height: '40px', display: 'block' }} />
        </div>

        {/* Mini Tile 2: ELA Thermal Heatmap Tile */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.6rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block', marginBottom: '0.3rem' }} className="mono">ELA HEATMAP</span>
          <div style={{ height: '38px', borderRadius: '6px', background: 'linear-gradient(135deg, #1e1b4b, #9333ea, #ef4444, #eab308)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }} className="mono">95.4% ELA</span>
          </div>
        </div>

        {/* Mini Tile 3: Recent Analyzed Faces Queue */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '0.6rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }} className="mono">SCAN QUEUE</span>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.3)', border: '1px solid var(--danger)', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 'bold' }}>FAKE</div>
            <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.3)', border: '1px solid var(--success)', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)', fontWeight: 'bold' }}>REAL</div>
            <div style={{ width: '22px', height: '22px', borderRadius: '4px', background: 'rgba(244, 63, 94, 0.3)', border: '1px solid var(--danger)', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 'bold' }}>FAKE</div>
          </div>
        </div>

      </div>

    </div>
  );
}
