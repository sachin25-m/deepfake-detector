import React from 'react';
import { Network, Database as DatabaseIcon, Cpu, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div className="page-wrapper">
      <div className="page-overlay" />

      <div className="page-content animate-slide-up" style={{ maxWidth: '900px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '0.75rem', letterSpacing: '-0.03em', color: '#0b1329', textShadow: '0 1px 3px rgba(255, 255, 255, 0.9)' }}>
            How RealNetra Works
          </h2>
          <p style={{ color: '#334155', fontSize: '1.05rem', lineHeight: 1.6, fontWeight: 600 }}>
            Understanding the genuine Machine Learning architecture behind RealNetra's deepfake detection engine.
          </p>
        </div>

        <div className="page-glass-card" style={{ padding: '2.25rem', marginBottom: '1.75rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0, 102, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF' }}>
              <Network size={24} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Vision Transformer (ViT) Architecture
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.98rem' }}>
            RealNetra utilizes a pre-trained Vision Transformer model (<code style={{ color: '#0066FF', fontWeight: 600 }}>dima806/deepfake_vs_real_image_detection</code>), fine-tuned specifically to detect facial deepfakes, face swaps, and synthetic facial manipulation.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.98rem' }}>
            Unlike traditional convolutional models that only focus on local receptive fields, the Vision Transformer splits facial crops into 16x16 pixel patches and uses self-attention mechanisms to evaluate global relationships, capturing boundary blending artifacts, unnatural skin textures, and synthetic facial warping.
          </p>
        </div>

        <div className="page-glass-card" style={{ padding: '2.25rem', marginBottom: '1.75rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
              <DatabaseIcon size={24} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Preprocessing & Face Localization
            </h3>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem', fontSize: '0.98rem' }}>
            To ensure genuine forensic detection regardless of image origin or metadata presence:
          </p>
          <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.98rem' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Face Localization:</strong> Automated face cascade detection locates facial regions and extracts the primary face with a 20% margin.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Standardized Normalization:</strong> Crops are resized to 224x224 RGB and normalized with mean/std parameters expected by the ViT backbone.</li>
            <li><strong>Metadata Separation:</strong> EXIF metadata is extracted purely as informational forensics and never dictates the classification verdict.</li>
          </ul>
        </div>

        <div className="page-glass-card" style={{ padding: '2.25rem', borderRadius: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Cpu size={24} />
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Inference & Uncertainty Handling
            </h3>
          </div>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.98rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Model output logits are transformed via Softmax into calibrated class probabilities. RealNetra enforces a three-state classification policy:
            </p>
            <ol style={{ paddingLeft: '1.5rem' }}>
              <li style={{ marginBottom: '0.5rem' }}><strong>REAL:</strong> Model fake probability is below 40% (high confidence in authentic media).</li>
              <li style={{ marginBottom: '0.5rem' }}><strong>DEEPFAKE:</strong> Model fake probability exceeds 60% (clear manipulation signatures detected).</li>
              <li><strong>UNCERTAIN:</strong> Borderline probabilities between 40% and 60% are flagged as uncertain to avoid false positives on ambiguous content.</li>
            </ol>
          </div>
        </div>

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

