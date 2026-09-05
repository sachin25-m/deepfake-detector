import React, { useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Trash2, List } from 'lucide-react';

export const INITIAL_HISTORY = [
  { id: 1, date: '2026-05-12 11:04', name: 'chatgpt_response.txt', result: 'AI GENERATED', confidence: 98.2 },
  { id: 2, date: '2026-05-12 10:23', name: 'video_interview.mp4', result: 'DEEPFAKE', confidence: 94.2 },
  { id: 3, date: '2026-05-11 09:15', name: 'profile_pic.png', result: 'REAL', confidence: 99.1 },
  { id: 4, date: '2026-05-10 16:45', name: 'political_speech.mp4', result: 'DEEPFAKE', confidence: 88.5 },
  { id: 5, date: '2026-05-09 11:30', name: 'event_photo.jpg', result: 'REAL', confidence: 95.8 },
  { id: 6, date: '2026-05-08 14:20', name: 'news_clip.mov', result: 'DEEPFAKE', confidence: 91.4 },
  { id: 7, date: '2026-05-07 08:10', name: 'document_scan.jpg', result: 'REAL', confidence: 97.3 },
];

export default function Dashboard() {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return INITIAL_HISTORY;
  });
  const [showAll, setShowAll] = useState(false);

  const displayedHistory = showAll ? history : history.slice(0, 4);

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      localStorage.setItem('scanHistory', JSON.stringify([]));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-overlay" />

      <div className="page-content animate-slide-up" style={{ maxWidth: '1020px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2.8rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#0b1329', textShadow: '0 1px 3px rgba(255, 255, 255, 0.9)' }}>
              Analysis Dashboard
            </h2>
            <p style={{ color: '#334155', fontSize: '1.05rem', fontWeight: 600, marginTop: '0.25rem' }}>
              Historical forensic records and detection statistics
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              className="glass-nav-pill" 
              style={{ padding: '0.65rem 1.25rem', borderRadius: '100px', border: 'none', background: 'rgba(255, 255, 255, 0.75)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }} 
              onClick={() => setShowAll(!showAll)}
            >
              <List size={17} /> {showAll ? 'Show Recent' : 'Show All'}
            </button>
            <button 
              style={{ padding: '0.65rem 1.25rem', borderRadius: '100px', background: 'rgba(239, 68, 68, 0.12)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.25)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }} 
              onClick={clearHistory}
            >
              <Trash2 size={17} /> Clear History
            </button>
          </div>
        </div>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="page-glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(0, 102, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066FF' }}>
              <Activity size={26} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Analyzed</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>128</h3>
            </div>
          </div>

          <div className="page-glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
              <ShieldAlert size={26} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Deepfakes Detected</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>34</h3>
            </div>
          </div>

          <div className="page-glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '20px' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Authentic Media</p>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>94</h3>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          Recent Activity
        </h3>

        <div className="page-glass-card" style={{ overflow: 'hidden', borderRadius: '24px', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <th style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                <th style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Name</th>
                <th style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</th>
                <th style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Result</th>
              </tr>
            </thead>
            <tbody>
              {displayedHistory.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>No history available.</td>
                </tr>
              ) : (
                displayedHistory.map((item, idx) => (
                  <tr key={item.id} style={{ borderBottom: idx !== displayedHistory.length - 1 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none' }}>
                    <td style={{ padding: '1.15rem 1.5rem', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>{item.date}</td>
                    <td style={{ padding: '1.15rem 1.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{item.name}</td>
                    <td style={{ padding: '1.15rem 1.5rem', fontWeight: 700, color: '#0066FF', fontSize: '0.95rem' }}>{item.confidence}%</td>
                    <td style={{ padding: '1.15rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.35rem 0.85rem', 
                        borderRadius: '100px', 
                        fontSize: '0.78rem', 
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        display: 'inline-block',
                        background: (item.result === 'DEEPFAKE' || item.result === 'AI GENERATED')
                          ? '#FEE2E2' 
                          : (item.result === 'UNCERTAIN') 
                            ? '#FEF3C7' 
                            : '#D1FAE5',
                        color: (item.result === 'DEEPFAKE' || item.result === 'AI GENERATED')
                          ? '#991B1B' 
                          : (item.result === 'UNCERTAIN') 
                            ? '#92400E' 
                            : '#065F46'
                      }}>
                        {item.result}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

