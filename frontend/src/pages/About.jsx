import React from 'react';
import { Network, Database as DatabaseIcon, Cpu, Layers, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
  return (
    <div className="animate-slide-up" style={{ maxWidth: '880px', margin: '0 auto', paddingTop: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '2.75rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.03em' }}>
          How <span className="text-gradient">RealNetra</span> Operates
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Understanding the multi-modal forensic inspection & neural deepfake detection pipeline.
        </p>
      </div>

      {/* Card 1: MesoNet & Spatial CNN */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border-hover)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '16px', border: '1px solid var(--primary-glow)' }}>
            <Network size={28} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>MesoNet & Spatial Convolutional Neural Network</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LAYER 1: MESOSCOPIC ANOMALY INSPECTOR</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.975rem' }}>
          Our neural architecture builds upon <strong>Meso4 CNNs</strong> (Afchar et al., IEEE WIFS). Rather than relying on simple metadata or facial recognition tags, it evaluates mesoscopic facial feature maps for subtle degradation, eye-to-mouth blending artifacts, and GAN upsampling noise.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.975rem' }}>
          Deepfakes leave microscopic traces—blurry boundaries, unnatural illumination shifts, and pixel perturbations that human eyes miss. RealNetra isolates these pixel-level discrepancies instantly.
        </p>
      </div>

      {/* Card 2: Multi-Modal Forensic Fusion */}
      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', borderRadius: '24px', border: '1px solid var(--glass-border-hover)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '16px', border: '1px solid var(--secondary-glow)' }}>
            <Layers size={28} color="var(--secondary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Multi-Modal Forensic Triangulation</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LAYER 2: ELA + 2D FFT + BOUNDARY SEAMS</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
          <div style={{ padding: '1.25rem', background: 'var(--btn-secondary-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
            <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem' }}>Error Level Analysis (ELA)</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>Detects compression ratio anomalies between spliced facial crops and background zones.</p>
          </div>
          <div style={{ padding: '1.25rem', background: 'var(--btn-secondary-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
            <strong style={{ color: 'var(--secondary)', display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem' }}>2D FFT Power Spectrum</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>Scans frequency domain for high-frequency checkerboard grid peaks from GAN & Diffusion models.</p>
          </div>
          <div style={{ padding: '1.25rem', background: 'var(--btn-secondary-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px' }}>
            <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.4rem', fontSize: '0.95rem' }}>Laplacian Seam Inspector</strong>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>Inspects edge gradient discontinuities and alpha feathering along face perimeters.</p>
          </div>
        </div>
      </div>

      {/* Card 3: Training Datasets */}
      <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid var(--success-glow)' }}>
            <DatabaseIcon size={28} color="var(--success)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Validated Benchmarks & Datasets</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>CROSS-MODEL EVALUATION</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.975rem' }}>
          RealNetra has been evaluated across industry-standard benchmark corpora to ensure resilience against diverse manipulation methods:
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
          <span className="badge badge-primary" style={{ padding: '0.5rem 1.25rem' }}>FaceForensics++</span>
          <span className="badge badge-primary" style={{ padding: '0.5rem 1.25rem', borderColor: 'var(--secondary-glow)', color: 'var(--secondary)', background: 'rgba(139, 92, 246, 0.1)' }}>DFDC (Deepfake Detection Challenge)</span>
          <span className="badge badge-primary" style={{ padding: '0.5rem 1.25rem', borderColor: 'var(--success-glow)', color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)' }}>Celeb-DF v2</span>
        </div>
      </div>

    </div>
  );
}
