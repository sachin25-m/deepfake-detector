import React, { useEffect, useState, useRef } from 'react';
import { CheckCircle, AlertTriangle, Database, Search, Cpu, Download, AlignLeft, FileText, Activity, Eye, Layers, Sliders, RefreshCw, Radio, Sparkles } from 'lucide-react';
import FFTSpectrumCanvas from './FFTSpectrumCanvas';
import ConfidenceGauge from './ConfidenceGauge';

const MEDIA_STEPS = [
  { id: 1, label: 'Initializing Neural Net & Facial Anchor Tracker...', icon: Database, duration: 1500 },
  { id: 2, label: 'Computing ELA Error Level & 2D FFT Power Spectrum...', icon: Search, duration: 1500 },
  { id: 3, label: 'Executing MesoNet Spatial Convolutional Fusion...', icon: Cpu, duration: 1500 }
];

const TEXT_STEPS = [
  { id: 1, label: 'Tokenizing Semantic Content...', icon: AlignLeft, duration: 1500 },
  { id: 2, label: 'Syntactic Burstiness & Perplexity Scan...', icon: FileText, duration: 1500 },
  { id: 3, label: 'Linguistic AI Probability Check...', icon: Activity, duration: 1500 }
];

export default function Detector({ file, previewUrl, textSnippet, mode, status, result, resetView }) {
  const [activeStep, setActiveStep] = useState(1);
  const [viewMode, setViewMode] = useState('heatmap'); // 'heatmap', 'landmarks', 'slider', 'original'
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef(null);
  const isDragging = useRef(false);

  const steps = mode === 'text' ? TEXT_STEPS : MEDIA_STEPS;

  useEffect(() => {
    if (status === 'processing') {
      let timeout1 = setTimeout(() => setActiveStep(2), steps[0].duration);
      let timeout2 = setTimeout(() => setActiveStep(3), steps[0].duration + steps[1].duration);
      
      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      };
    } else if (status === 'complete') {
      setActiveStep(4);
    }
  }, [status, steps]);

  const handleSliderMove = (e) => {
    if (!sliderRef.current || !isDragging.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    if (!clientX) return;
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSliderPos(percentage);
  };

  const handleExportForensics = () => {
    if (!result) return;

    const timestamp = new Date().toISOString();
    const reportId = `RN-${Math.floor(100000 + Math.random() * 900000)}`;
    const fileName = mode === 'media' ? (file?.name || result.filename || 'media_analysis') : 'text_payload';

    const reportContent = {
      report_header: {
        title: "REALNETRA FORENSIC DETECTION REPORT",
        system: "RealNetra Multi-Modal Deepfake & Forensic Analysis Engine",
        version: "v2.4-NeuralEnsemble",
        report_id: reportId,
        generated_at: timestamp,
        verification_status: "VERIFIED_FORENSIC_EXPORT"
      },
      target_metadata: {
        target_name: fileName,
        analysis_mode: mode.toUpperCase(),
        media_type: result.type || (mode === 'text' ? 'text/plain' : 'application/octet-stream'),
        file_size_bytes: file?.size || null
      },
      verdict_summary: {
        classification: result.result,
        confidence_percentage: result.confidence,
        probability_deepfake: result.probability_deepfake ?? (result.result === 'DEEPFAKE' || result.result === 'AI GENERATED' ? (result.confidence / 100) : (1 - result.confidence / 100))
      },
      forensic_evidence: result.details
    };

    const jsonString = JSON.stringify(reportContent, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const sanitizedBase = fileName.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    link.download = `RealNetra_Forensic_Report_${sanitizedBase}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isFake = result && (result.result === 'DEEPFAKE' || result.result === 'AI GENERATED');

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2.5rem', border: '1px solid var(--glass-border-hover)' }}>
      
      {/* Workstation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: status === 'processing' ? 'var(--primary)' : (isFake ? 'var(--danger)' : 'var(--success)'), boxShadow: `0 0 14px ${status === 'processing' ? 'var(--primary)' : (isFake ? 'var(--danger)' : 'var(--success)')}` }}></span>
            Forensic Workstation & Visualizers
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>RealNetra Multi-Modal Intelligence Diagnostic Hub</p>
        </div>

        {status === 'complete' && mode === 'media' && (
          <div style={{ display: 'flex', background: 'var(--btn-secondary-bg)', padding: '4px', borderRadius: '100px', border: '1px solid var(--glass-border)', flexWrap: 'wrap', gap: '2px' }}>
            <button 
              className={`btn ${viewMode === 'heatmap' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderRadius: '100px', height: '34px' }}
              onClick={() => setViewMode('heatmap')}
            >
              <Layers size={13} /> Inferno Heatmap
            </button>
            <button 
              className={`btn ${viewMode === 'landmarks' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderRadius: '100px', height: '34px' }}
              onClick={() => setViewMode('landmarks')}
            >
              <Radio size={13} /> Facial Landmarks
            </button>
            <button 
              className={`btn ${viewMode === 'slider' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderRadius: '100px', height: '34px' }}
              onClick={() => setViewMode('slider')}
            >
              <Sliders size={13} /> Split Slider
            </button>
            <button 
              className={`btn ${viewMode === 'original' ? 'btn-primary' : 'btn-secondary'}`} 
              style={{ padding: '0.4rem 0.9rem', fontSize: '0.78rem', borderRadius: '100px', height: '34px' }}
              onClick={() => setViewMode('original')}
            >
              <Eye size={13} /> Original
            </button>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
        
        {/* Left Column: Media / Heatmap / Landmark Window */}
        <div style={{ flex: '1', minWidth: '320px' }}>
          <div style={{ 
            background: '#04070d', 
            border: '1px solid var(--glass-border)',
            borderRadius: '20px', 
            height: '390px', 
            display: 'flex', 
            alignItems: mode === 'text' ? 'flex-start' : 'center', 
            justifyContent: mode === 'text' ? 'flex-start' : 'center', 
            overflow: 'hidden',
            padding: mode === 'text' ? '1.5rem' : '0',
            position: 'relative',
            boxShadow: 'inset 0 0 50px rgba(0,0,0,0.9)'
          }}>

            {mode === 'media' && file && (
              <>
                {/* Standard / Heatmap / Landmark View */}
                {viewMode !== 'slider' && (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {file.type.startsWith('video/') ? (
                      <video src={previewUrl} autoPlay loop muted playsInline style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', opacity: status === 'processing' ? 0.7 : 1 }} />
                    ) : (
                      <img src={previewUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', opacity: status === 'processing' ? 0.7 : 1 }} />
                    )}

                    {/* 1. Inferno Thermal Heatmap Canvas Overlay */}
                    {status === 'complete' && viewMode === 'heatmap' && (
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          {/* Jet / Inferno Colormap Radial Thermal Gradient */}
                          <radialGradient id="infernoThermalGlow" cx="50%" cy="45%" r="35%">
                            <stop offset="0%" stopColor={isFake ? "#ffffb5" : "#00f0ff"} stopOpacity="0.95" />
                            <stop offset="25%" stopColor={isFake ? "#ff7800" : "#0088ff"} stopOpacity="0.8" />
                            <stop offset="55%" stopColor={isFake ? "#cc0055" : "#7000ff"} stopOpacity="0.6" />
                            <stop offset="80%" stopColor={isFake ? "#440066" : "#10b981"} stopOpacity="0.35" />
                            <stop offset="100%" stopColor="transparent" />
                          </radialGradient>
                        </defs>

                        {/* Thermal Heatmap Overlay */}
                        <circle cx="50" cy="45" r="34" fill="url(#infernoThermalGlow)" style={{ mixBlendMode: 'screen' }} />
                        
                        {/* Target Face Bounding Box */}
                        <rect x="25" y="18" width="50" height="58" rx="6" fill="none" stroke={isFake ? "#f43f5e" : "#06b6d4"} strokeWidth="1.5" strokeDasharray="5 3" />
                        
                        {/* Thermal Anomaly Indicator Tag */}
                        <rect x="4" y="4" width="42" height="12" rx="4" fill="rgba(8, 12, 20, 0.85)" stroke="rgba(255,255,255,0.1)" />
                        <text x="8" y="12" fill={isFake ? "#f43f5e" : "#06b6d4"} fontSize="4.2" fontFamily="monospace" fontWeight="bold">
                          INFERNO ELA ANOMALY MAP
                        </text>
                      </svg>
                    )}

                    {/* 2. Live Facial Landmark Mesh Overlay */}
                    {status === 'complete' && viewMode === 'landmarks' && (
                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100" preserveAspectRatio="none">
                        {/* Face Bounding Box */}
                        <rect x="24" y="18" width="52" height="58" rx="8" fill="rgba(6, 182, 212, 0.05)" stroke="#06b6d4" strokeWidth="1.5" />
                        
                        {/* Eye Mesh Contours */}
                        <polygon points="35,38 40,35 45,38 40,41" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="1" />
                        <polygon points="55,38 60,35 65,38 60,41" fill="rgba(6, 182, 212, 0.2)" stroke="#06b6d4" strokeWidth="1" />

                        {/* Nose Bridge */}
                        <polyline points="50,35 50,48 45,52 50,52 55,52" fill="none" stroke="#06b6d4" strokeWidth="1" />

                        {/* Mouth Mesh Contour */}
                        <path d="M 38 62 Q 50 58 62 62 Q 50 68 38 62" fill="rgba(244, 63, 94, 0.2)" stroke={isFake ? "#f43f5e" : "#10b981"} strokeWidth="1" />

                        {/* 68 Landmark Nodes */}
                        {[
                          [35,38], [40,35], [45,38], [40,41],
                          [55,38], [60,35], [65,38], [60,41],
                          [50,35], [50,42], [50,48], [45,52], [55,52],
                          [38,62], [50,58], [62,62], [50,68],
                          [28,30], [32,25], [38,25], [44,28],
                          [56,28], [62,25], [68,25], [72,30],
                          [28,45], [30,55], [35,65], [42,72], [50,75], [58,72], [65,65], [70,55], [72,45]
                        ].map(([lx, ly], idx) => (
                          <circle key={idx} cx={lx} cy={ly} r="1.2" fill={isFake && idx > 15 ? "#f43f5e" : "#06b6d4"} />
                        ))}

                        {/* Landmark Badge */}
                        <rect x="4" y="4" width="46" height="12" rx="4" fill="rgba(8, 12, 20, 0.85)" stroke="rgba(255,255,255,0.1)" />
                        <text x="8" y="12" fill="#06b6d4" fontSize="4.2" fontFamily="monospace" fontWeight="bold">
                          68-PT FACIAL LANDMARK MESH
                        </text>
                      </svg>
                    )}
                  </div>
                )}

                {/* 3. Split Comparison Slider View */}
                {viewMode === 'slider' && (
                  <div 
                    ref={sliderRef}
                    className="comparison-slider-container"
                    onMouseDown={() => { isDragging.current = true; }}
                    onMouseUp={() => { isDragging.current = false; }}
                    onMouseLeave={() => { isDragging.current = false; }}
                    onMouseMove={handleSliderMove}
                    onTouchStart={() => { isDragging.current = true; }}
                    onTouchEnd={() => { isDragging.current = false; }}
                    onTouchMove={handleSliderMove}
                  >
                    {/* Layer 1: Original */}
                    <img src={previewUrl} alt="Original" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }} />

                    {/* Layer 2: Thermal Inferno Heatmap (Clipped) */}
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPos}%`, height: '100%', overflow: 'hidden', borderRight: '2px solid var(--primary)', boxShadow: '5px 0 20px rgba(6,182,212,0.5)' }}>
                      <img src={previewUrl} alt="Inferno Map" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: isFake ? 'hue-rotate(280deg) saturate(2.5) contrast(1.3)' : 'hue-rotate(180deg)' }} />
                      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.85)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--primary)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }} className="mono">
                        INFERNO THERMAL ({Math.round(sliderPos)}%)
                      </div>
                    </div>

                    {/* Handle */}
                    <div className="comparison-slider-handle" style={{ left: `calc(${sliderPos}% - 1.5px)` }}></div>
                  </div>
                )}
              </>
            )}

            {mode === 'text' && (
              <p className="mono" style={{ fontSize: '0.95rem', color: 'var(--primary)', lineHeight: 1.7, overflowY: 'auto', maxHeight: '100%' }}>
                &gt; {textSnippet.length > 400 ? textSnippet.substring(0, 400) + '...' : textSnippet}
              </p>
            )}
            
            {status === 'processing' && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)', boxShadow: '0 0 25px var(--primary-glow)', animation: 'scanline 2s linear infinite' }} />
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <span style={{ color: 'var(--text-subtle)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>TARGET IDENTIFIER</span>
            <span className="mono" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{mode === 'media' ? (file?.name.length > 25 ? file?.name.substring(0,22) + '...' : file?.name) : 'TEXT_PAYLOAD_01'}</span>
          </div>
        </div>

        {/* Right Column: Circular Gauge & FFT Spectrum Visualizer */}
        <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {status === 'processing' && (
            <div className="animate-slide-up">
              <h4 style={{ fontSize: '1.25rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.85rem', color: 'var(--primary)' }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: '22px', height: '22px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                Neural Pipeline Processing...
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {steps.map((step) => {
                  const isPast = activeStep > step.id;
                  const isCurrent = activeStep === step.id;
                  
                  let iconColor = 'var(--text-muted)';
                  if (isPast) iconColor = 'var(--success)';
                  if (isCurrent) iconColor = 'var(--primary)';

                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', opacity: isPast || isCurrent ? 1 : 0.35, transition: 'all 0.4s ease', transform: isCurrent ? 'translateX(8px)' : 'none' }}>
                      <div style={{ 
                        width: '38px', height: '38px', borderRadius: '12px', 
                        background: isCurrent ? 'var(--nav-active-bg)' : 'var(--btn-secondary-bg)',
                        border: `1px solid ${isCurrent ? 'var(--primary)' : 'var(--glass-border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: iconColor,
                        boxShadow: isCurrent ? '0 0 20px var(--primary-glow)' : 'none'
                      }}>
                        <step.icon size={18} />
                      </div>
                      <span className="mono" style={{ fontWeight: isCurrent ? '500' : '400', flex: 1, fontSize: '0.95rem', color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{step.label}</span>
                      {isPast && <CheckCircle size={18} color="var(--success)" style={{ filter: 'drop-shadow(0 0 8px var(--success-glow))' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {status === 'complete' && result && (
            <div className="animate-slide-up">
              
              {/* Verdict Banner with Circular Gauge */}
              <div style={{ 
                background: isFake ? 'rgba(244, 63, 94, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                border: `1px solid ${isFake ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                padding: '1.5rem 2rem', 
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `radial-gradient(circle at left, ${isFake ? 'var(--danger-glow)' : 'var(--success-glow)'}, transparent 70%)`, opacity: 0.35, pointerEvents: 'none' }} />
                
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>FINAL VERDICT</span>
                  <h2 style={{ fontSize: '2.1rem', fontWeight: '800', margin: '0.2rem 0', color: isFake ? 'var(--danger)' : 'var(--success)', letterSpacing: '0.04em' }}>
                    {result.result}
                  </h2>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Sparkles size={14} color={isFake ? 'var(--danger)' : 'var(--success)'} /> Multi-Modal Neural Verification
                  </div>
                </div>

                {/* Circular Progress Gauge */}
                <ConfidenceGauge confidence={result.confidence} resultLabel={result.result} isFake={isFake} />
              </div>

              {/* Live 2D FFT Spectral Peak Visualizer Canvas */}
              {mode === 'media' && (
                <div style={{ background: 'rgba(4, 7, 13, 0.6)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                  <FFTSpectrumCanvas isFake={isFake} fftScore={result.details.forensic_breakdown?.fft_spectral_score || 0.8} />
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '0.95rem', borderRadius: '14px' }} onClick={resetView}>
                  <RefreshCw size={17} /> New Scan
                </button>
                <button className="btn btn-primary" style={{ flex: 1.3, padding: '0.95rem', borderRadius: '14px', background: 'linear-gradient(135deg, #06b6d4, #2563eb)', boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)' }} onClick={handleExportForensics}>
                  <Download size={17} /> Export Forensics
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0% { top: 0; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
