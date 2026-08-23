import React from 'react';
import { Network, Database as DatabaseIcon, Cpu, ShieldCheck } from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>How RealNetra Works</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Understanding the genuine Machine Learning architecture behind RealNetra's deepfake detection engine.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Network size={32} color="var(--primary)" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Vision Transformer (ViT) Architecture</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
          RealNetra utilizes a pre-trained Vision Transformer model (<code style={{ color: 'var(--primary)' }}>dima806/deepfake_vs_real_image_detection</code>), fine-tuned specifically to detect facial deepfakes, face swaps, and synthetic facial manipulation.
        </p>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Unlike traditional convolutional models that only focus on local receptive fields, the Vision Transformer splits facial crops into 16x16 pixel patches and uses self-attention mechanisms to evaluate global relationships, capturing boundary blending artifacts, unnatural skin textures, and synthetic facial warping.
        </p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <DatabaseIcon size={32} color="var(--accent)" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Preprocessing & Face Localization</h3>
        </div>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1rem' }}>
          To ensure genuine forensic detection regardless of image origin or metadata presence:
        </p>
        <ul style={{ listStylePosition: 'inside', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <li style={{ marginBottom: '0.5rem' }}><strong>Face Localization:</strong> Automated face cascade detection locates facial regions and extracts the primary face with a 20% margin.</li>
          <li style={{ marginBottom: '0.5rem' }}><strong>Standardized Normalization:</strong> Crops are resized to 224x224 RGB and normalized with mean/std parameters expected by the ViT backbone.</li>
          <li><strong>Metadata Separation:</strong> EXIF metadata is extracted purely as informational forensics and never dictates the classification verdict.</li>
        </ul>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <Cpu size={32} color="var(--success)" />
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Inference & Uncertainty Handling</h3>
        </div>
        <div style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
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
    </div>
  );
}
