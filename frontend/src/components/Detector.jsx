import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Database, Search, Cpu, Download, AlignLeft, FileText, Activity } from 'lucide-react';

const MEDIA_STEPS = [
  { id: 1, label: 'Initializing Neural Net...', icon: Database, duration: 1500 },
  { id: 2, label: 'Isolating Artifacts & Metadata...', icon: Search, duration: 1500 },
  { id: 3, label: 'Running 3D CNN Inference...', icon: Cpu, duration: 1500 }
];

const TEXT_STEPS = [
  { id: 1, label: 'Tokenizing Semantic Content...', icon: AlignLeft, duration: 1500 },
  { id: 2, label: 'Syntactic Pattern Scan...', icon: FileText, duration: 1500 },
  { id: 3, label: 'LLM Probability Check...', icon: Activity, duration: 1500 }
];

export default function Detector({ file, previewUrl, textSnippet, mode, status, result, resetView }) {
  const [activeStep, setActiveStep] = useState(1);
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

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '3rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
      
      <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
        {/* Left column: Preview */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{ 
            background: 'var(--bg-panel)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '16px', 
            height: '300px', 
            display: 'flex', 
            alignItems: mode === 'text' ? 'flex-start' : 'center', 
            justifyContent: mode === 'text' ? 'flex-start' : 'center', 
            overflow: 'hidden',
            padding: mode === 'text' ? '1.5rem' : '0',
            position: 'relative',
            boxShadow: 'inset 0 0 50px var(--glass-border)'
          }}>
            {mode === 'media' && file && file.type.startsWith('video/') && (
              <video src={previewUrl} autoPlay loop muted playsInline style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', opacity: status === 'processing' ? 0.7 : 1 }} />
            )}
            {mode === 'media' && file && file.type.startsWith('image/') && (
              <img src={previewUrl} alt="Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', opacity: status === 'processing' ? 0.7 : 1 }} />
            )}
            {mode === 'text' && (
              <p className="mono" style={{ fontSize: '1rem', color: 'var(--primary)', lineHeight: 1.6, overflowY: 'auto', maxHeight: '100%' }}>
                &gt; {textSnippet.length > 300 ? textSnippet.substring(0, 300) + '...' : textSnippet}
              </p>
            )}
            
            {status === 'processing' && (
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--primary)', boxShadow: '0 0 15px var(--primary-glow)', animation: 'scanline 2s linear infinite' }} />
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>TARGET_ID</span>
            <span className="mono" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>{mode === 'media' ? file?.name.substring(0,20) : 'TEXT_PAYLOAD_01'}</span>
          </div>
        </div>

        {/* Right column: Processing/Results */}
        <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {status === 'processing' && (
            <div className="animate-slide-up">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--primary)' }}>
                <span className="animate-spin" style={{ display: 'inline-block', width: '24px', height: '24px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></span>
                System Analysis in Progress...
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {steps.map((step) => {
                  const isPast = activeStep > step.id;
                  const isCurrent = activeStep === step.id;
                  
                  let iconColor = 'var(--text-muted)';
                  if (isPast) iconColor = 'var(--success)';
                  if (isCurrent) iconColor = 'var(--primary)';

                  return (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', opacity: isPast || isCurrent ? 1 : 0.3, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: isCurrent ? 'translateX(10px)' : 'none' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '12px', 
                        background: isCurrent ? 'var(--nav-active-bg)' : 'var(--btn-secondary-bg)',
                        border: `1px solid ${isCurrent ? 'var(--nav-active-border)' : 'transparent'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: iconColor,
                        boxShadow: isCurrent ? '0 0 20px var(--primary-glow)' : 'none'
                      }}>
                        <step.icon size={20} />
                      </div>
                      <span className="mono" style={{ fontWeight: isCurrent ? '500' : '400', flex: 1, fontSize: '1rem', color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)' }}>{step.label}</span>
                      {isPast && <CheckCircle size={20} color="var(--success)" style={{ filter: 'drop-shadow(0 0 8px var(--success-glow))' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {status === 'complete' && result && (
            <div className="animate-slide-up" style={{ animation: 'slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
              <div style={{ 
                background: (result.result === 'DEEPFAKE' || result.result === 'AI GENERATED') ? 'rgba(255, 0, 60, 0.05)' : 'rgba(0, 255, 102, 0.05)',
                border: `1px solid ${(result.result === 'DEEPFAKE' || result.result === 'AI GENERATED') ? 'rgba(255, 0, 60, 0.3)' : 'rgba(0, 255, 102, 0.3)'}`,
                padding: '2.5rem', 
                borderRadius: '16px',
                textAlign: 'center',
                marginBottom: '2rem',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: `radial-gradient(circle at center, ${(result.result === 'DEEPFAKE' || result.result === 'AI GENERATED') ? 'var(--danger-glow)' : 'var(--success-glow)'}, transparent 70%)`, opacity: 0.5, pointerEvents: 'none' }} />
                
                {(result.result === 'DEEPFAKE' || result.result === 'AI GENERATED') ? (
                  <AlertTriangle size={56} color="var(--danger)" style={{ margin: '0 auto 1.5rem auto', filter: 'drop-shadow(0 0 15px var(--danger-glow))' }} />
                ) : (
                  <CheckCircle size={56} color="var(--success)" style={{ margin: '0 auto 1.5rem auto', filter: 'drop-shadow(0 0 15px var(--success-glow))' }} />
                )}
                
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: (result.result === 'DEEPFAKE' || result.result === 'AI GENERATED') ? 'var(--danger)' : 'var(--success)', letterSpacing: '0.05em' }}>
                  {result.result}
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--btn-secondary-bg)', padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid var(--glass-border)' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>CONFIDENCE:</span> 
                  <span className="mono" style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-main)' }}>{result.confidence}%</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div style={{ padding: '1.25rem', background: 'var(--btn-secondary-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Model Architecture</p>
                  <p className="mono" style={{ fontWeight: '500', color: 'var(--primary)', fontSize: '1.1rem' }}>{result.details.model_used}</p>
                </div>
                <div style={{ padding: '1.25rem', background: 'var(--btn-secondary-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
                    {mode === 'media' ? 'Artifact Signatures' : 'Semantic Anomalies'}
                  </p>
                  <p className="mono" style={{ fontWeight: '500', color: 'var(--accent)', fontSize: '1.1rem' }}>
                     {mode === 'media' ? result.details.artifacts_found : result.details.sentences_analyzed}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button className="btn btn-secondary" style={{ flex: 1, padding: '1.25rem', borderRadius: '12px' }} onClick={resetView}>New Scan Sequence</button>
                <button className="btn btn-primary" style={{ flex: 1, padding: '1.25rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--success), #00cc55)', boxShadow: '0 4px 20px var(--success-glow)' }} onClick={() => alert('Secure Report Download Initiated!')}>
                  <Download size={20} /> Export Forensics
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      
      <style>{`
        @keyframes scanline {
          0% { top: 0; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
