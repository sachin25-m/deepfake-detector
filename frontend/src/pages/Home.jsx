import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, Lock, ArrowRight } from 'lucide-react';
import ImageComparisonSlider from '../components/ImageComparisonSlider';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page-wrapper">
      {/* Background soft natural overlay for readability */}
      <div className="home-page-overlay" />

      <div className="home-page-content">
        {/* Main Hero Section */}
        <section className="hero-section">
          {/* Left Column: Copy & CTA */}
          <div className="hero-left animate-slide-up">
            <p className="hero-eyebrow">
              PEOPLE SEE IMAGES. WE SEE THE TRUTH.
            </p>
            
            <h1 className="hero-title">
              Spot the <span className="highlight-fake">fake</span><br />
              before it spreads.
            </h1>
            
            <p className="hero-subtitle">
              RealNetra helps detect deepfakes, manipulated media, and AI-generated content using advanced forensic analysis.
            </p>

            <div style={{ marginTop: '0.5rem' }}>
              <button 
                className="cta-button-start" 
                onClick={() => navigate('/upload')}
              >
                Start Detecting <ArrowRight size={19} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Right Column: Real vs Manipulated Comparison Widget */}
          <div className="hero-right animate-slide-up delay-100">
            <ImageComparisonSlider />
          </div>
        </section>

        {/* Floating Features / Benefits Bar at Bottom */}
        <div className="features-bar-container animate-slide-up delay-200">
          <div className="features-bar-glass">
            
            <div className="feature-item">
              <div className="feature-icon-badge">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div className="feature-info">
                <span className="feature-title">Accurate Analysis</span>
                <span className="feature-desc">Detect manipulated media with precision.</span>
              </div>
            </div>

            <div className="feature-divider" />

            <div className="feature-item">
              <div className="feature-icon-badge">
                <Zap size={20} strokeWidth={2} />
              </div>
              <div className="feature-info">
                <span className="feature-title">Fast Results</span>
                <span className="feature-desc">Get results in seconds.</span>
              </div>
            </div>

            <div className="feature-divider" />

            <div className="feature-item">
              <div className="feature-icon-badge">
                <Lock size={20} strokeWidth={2} />
              </div>
              <div className="feature-info">
                <span className="feature-title">Your Privacy</span>
                <span className="feature-desc">Your data stays secure and private.</span>
              </div>
            </div>

          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="minimal-footer">
          <span>&copy; 2026 RealNetra. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            A safer digital tomorrow. <span style={{ display: 'inline-block', width: '20px', height: '2px', backgroundColor: 'currentColor', opacity: 0.6 }} />
          </span>
        </footer>
      </div>
    </div>
  );
}

