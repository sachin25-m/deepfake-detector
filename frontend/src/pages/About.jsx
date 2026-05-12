import React from 'react';
import { Network, Database as DatabaseIcon, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>How RealNetra Works</h2>
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
          RealNetra has been validated using industry-standard datasets to ensure robust detection against multiple generation techniques:
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
