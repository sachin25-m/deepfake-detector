import React, { useEffect, useRef } from 'react';

export default function FFTSpectrumCanvas({ isFake = false, fftScore = 0.85 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 300;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 140;
    };
    resize();

    let offset = 0;

    const render = () => {
      offset += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const pointsCount = 45;
      const step = w / pointsCount;

      // Grid lines background
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.lineWidth = 1;
      for (let y = 20; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Draw spectral frequency curve
      ctx.beginPath();
      ctx.moveTo(0, h - 20);

      const spectrumValues = [];

      for (let i = 0; i <= pointsCount; i++) {
        const x = i * step;
        const normX = i / pointsCount;
        
        // Base frequency curve
        let baseAmp = Math.sin(normX * Math.PI * 4 + offset) * 15 + Math.cos(normX * Math.PI * 8 - offset) * 10;
        
        // Add High-Frequency Grid Spikes for Deepfake / GAN artifacts
        if (isFake && normX > 0.55 && normX < 0.85) {
          const spikePhase = (normX - 0.7) * 25;
          baseAmp += Math.exp(-spikePhase * spikePhase) * 55 * (0.8 + 0.2 * Math.sin(offset * 3));
        }

        const y = Math.max(15, Math.min(h - 15, h / 2 - baseAmp));
        spectrumValues.push({ x, y });

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      // Fill gradient under frequency curve
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      if (isFake) {
        gradient.addColorStop(0, 'rgba(244, 63, 94, 0.4)');
        gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');
      } else {
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.4)');
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
      }

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke Line
      ctx.beginPath();
      for (let i = 0; i < spectrumValues.length; i++) {
        const pt = spectrumValues[i];
        if (i === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = isFake ? '#f43f5e' : '#06b6d4';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Peak Highlight marker if artificial spike is detected
      if (isFake) {
        const peakPt = spectrumValues[Math.floor(pointsCount * 0.7)];
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(peakPt.x, peakPt.y, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(244, 63, 94, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(peakPt.x, peakPt.y, 8 + Math.sin(offset * 4) * 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isFake, fftScore]);

  return (
    <div style={{ width: '100%', height: '140px', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ position: 'absolute', top: 6, left: 10, fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }} className="mono">
        2D FFT SPECTRAL POWER DENSITY
      </div>
      {isFake && (
        <div style={{ position: 'absolute', top: 6, right: 10, fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 'bold' }} className="mono">
          HIGH-FREQ GRID PEAK SPIKE
        </div>
      )}
    </div>
  );
}
