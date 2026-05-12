import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, Image as ImageIcon, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', minHeight: 'calc(100vh - 140px)', justifyContent: 'center', padding: '2rem 0' }}>
      <div className="animate-slide-up delay-100" style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        padding: '0.5rem 1.25rem', 
        background: 'rgba(2, 132, 199, 0.05)', 
        border: '1px solid rgba(2, 132, 199, 0.2)',
        borderRadius: '100px',
        color: 'var(--primary)',
        fontWeight: '600',
        marginBottom: '2.5rem',
        boxShadow: '0 0 20px rgba(2, 132, 199, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        <ShieldCheck size={18} />
        <span style={{ letterSpacing: '0.05em', textTransform: 'uppercase', fontSize: '0.85rem' }}>Next-Gen AI Security</span>
      </div>
      
      <h1 className="animate-slide-up delay-200" style={{ 
        fontSize: 'clamp(3rem, 8vw, 5.5rem)', 
        fontWeight: '800', 
        lineHeight: 1.05, 
        marginBottom: '1.5rem', 
        maxWidth: '1000px',
        textShadow: '0 10px 30px rgba(0,0,0,0.05)',
        color: 'var(--text-main)'
      }}>
        Welcome to <span style={{ color: 'var(--primary)' }}>RealNetra</span><br/>
        Deepfake Detection
      </h1>
      


      <div className="animate-slide-up delay-300" style={{ display: 'flex', gap: '1.5rem', marginBottom: '5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem', borderRadius: '16px' }} onClick={() => navigate('/upload')}>
          Upload Media to Detect <ArrowRight size={20} />
        </button>
        <button className="btn btn-secondary" style={{ fontSize: '1.125rem', padding: '1.25rem 2.5rem', borderRadius: '16px' }} onClick={() => navigate('/about')}>
          Learn How It Works
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1100px' }}>
        <FeatureCard 
          icon={<Video size={28} color="var(--primary)" />} 
          title="Video Analysis" 
          desc="Frame-by-frame temporal consistency checks using advanced 3D CNN architectures to catch subtle deepfakes."
          delay="100ms"
        />
        <FeatureCard 
          icon={<ImageIcon size={28} color="var(--secondary)" />} 
          title="Image Forensics" 
          desc="Highlighting pixel inconsistencies, noise patterns, and AI-generated blending artifacts invisible to the human eye."
          delay="200ms"
        />
        <FeatureCard 
          icon={<AlertTriangle size={28} color="var(--accent)" />} 
          title="Risk Mitigation" 
          desc="Protect yourself against misinformation, cybercrime, and identity theft with enterprise-grade threat detection."
          delay="300ms"
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div className="glass-panel animate-slide-up" style={{ 
      padding: '2.5rem', 
      textAlign: 'left', 
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      animationDelay: delay,
      animationFillMode: 'both'
    }}>
      <div style={{ 
        width: '64px', height: '64px', 
        borderRadius: '16px', 
        background: 'rgba(0,0,0,0.03)', 
        border: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.02)'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', letterSpacing: '-0.02em' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
