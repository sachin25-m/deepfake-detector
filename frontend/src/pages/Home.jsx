import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Image as ImageIcon, ArrowRight, Zap, Radio } from 'lucide-react';
import ForensicHUD from '../components/ForensicHUD';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '2rem 0', minHeight: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {/* 2-Column Split-Screen Grid Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '3.5rem',
        alignItems: 'center',
        maxWidth: '1240px',
        margin: '0 auto',
        width: '100%',
        marginBottom: '4rem'
      }}>
        
        {/* Left Column: Hero Content & Actions */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          
          {/* Badge */}
          <div className="animate-slide-up" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.6rem', 
            padding: '0.45rem 1.1rem', 
            background: 'rgba(6, 182, 212, 0.08)', 
            border: '1px solid var(--glass-border)',
            borderRadius: '100px',
            color: 'var(--primary)',
            fontWeight: '600',
            marginBottom: '1.5rem'
          }}>
            <ShieldCheck size={16} />
            <span style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: '0.78rem' }}>NEXT-GEN AI SECURITY</span>
          </div>

          {/* Crisp Heading (text-3xl md:text-5xl font-bold) */}
          <h1 className="animate-slide-up" style={{ 
            fontSize: 'clamp(1.85rem, 3.8vw, 2.75rem)', 
            fontWeight: '800', 
            lineHeight: 1.15, 
            marginBottom: '1.25rem',
            color: 'var(--text-main)',
            maxWidth: '580px'
          }}>
            Unmask Synthetic Media with <span className="text-gradient">RealNetra Forensics</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-slide-up" style={{
            fontSize: '1.05rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            marginBottom: '2rem',
            maxWidth: '520px'
          }}>
            Enterprise multi-modal AI scanner analyzing mesoscopic facial noise, compression ELA discrepancies, and 2D FFT spectral peaks in seconds.
          </p>

          {/* High-Contrast CTA Buttons */}
          <div className="animate-slide-up" style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" style={{ fontSize: '1rem', padding: '1rem 2.25rem', borderRadius: '14px' }} onClick={() => navigate('/upload')}>
              Launch Detection Engine <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary" style={{ fontSize: '1rem', padding: '1rem 2rem', borderRadius: '14px' }} onClick={() => navigate('/about')}>
              Explore Architecture
            </button>
          </div>

          {/* Single Row 3-Stat Badge Bar */}
          <div className="animate-slide-up" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '0.85rem 1.25rem',
            background: 'var(--btn-secondary-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '580px',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '120px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>DETECTION PRECISION</span>
              <strong className="mono text-gradient" style={{ fontSize: '1.15rem', fontWeight: 800 }}>99.2%</strong>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--glass-border)' }} />
            <div style={{ flex: '1', minWidth: '100px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>LATENCY</span>
              <strong className="mono" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>&lt; 1.4s</strong>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--glass-border)' }} />
            <div style={{ flex: '1', minWidth: '100px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', display: 'block', letterSpacing: '0.05em' }}>MODALITY</span>
              <strong className="mono text-gradient-success" style={{ fontSize: '1.15rem', fontWeight: 800 }}>5 Layers</strong>
            </div>
          </div>

        </div>

        {/* Right Column: High-Tech Forensic Screen HUD Visualizer */}
        <div className="animate-slide-up" style={{ width: '100%' }}>
          <ForensicHUD />
        </div>

      </div>

      {/* Feature Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.75rem', width: '100%', maxWidth: '1240px', margin: '0 auto' }}>
        <FeatureCard 
          icon={<Video size={24} color="var(--primary)" />} 
          title="Multi-Frame Temporal CNN" 
          desc="Tracks inter-frame jitter, blinking anomalies, and facial landmark inconsistencies across video sequences."
        />
        <FeatureCard 
          icon={<ImageIcon size={24} color="var(--secondary)" />} 
          title="Error Level Analysis (ELA)" 
          desc="Exposes compression ratio disparity between facial ROI crops and background zones in high-res images."
        />
        <FeatureCard 
          icon={<Zap size={24} color="var(--accent)" />} 
          title="2D FFT Spectral Scan" 
          desc="Identifies high-frequency periodic grid artifacts left behind by generative GANs and Diffusion models."
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
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      borderRadius: '20px'
    }}>
      <div style={{ 
        width: '48px', height: '48px', 
        borderRadius: '14px', 
        background: 'var(--btn-secondary-bg)', 
        border: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
