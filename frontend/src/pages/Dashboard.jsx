import React, { useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Trash2, List } from 'lucide-react';

const INITIAL_HISTORY = [
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
    <div className="animate-slide-up" style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Analysis Dashboard</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.75rem 1rem' }} onClick={() => setShowAll(!showAll)}>
            <List size={18} /> {showAll ? 'Show Recent' : 'Show All'}
          </button>
          <button className="btn" style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={clearHistory}>
            <Trash2 size={18} /> Clear History
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Activity size={32} color="var(--primary)" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Analyzed</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>128</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={32} color="var(--danger)" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Deepfakes Detected</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>34</h3>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldCheck size={32} color="var(--success)" />
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Authentic Media</p>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700' }}>94</h3>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Activity</h3>
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Date</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>File Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Confidence</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '500' }}>Result</th>
            </tr>
          </thead>
          <tbody>
            {displayedHistory.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No history available.</td>
              </tr>
            ) : (
              displayedHistory.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: idx !== displayedHistory.length - 1 ? '1px solid var(--glass-border)' : 'none' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{item.date}</td>
                <td style={{ padding: '1rem' }}>{item.name}</td>
                <td style={{ padding: '1rem' }}>{item.confidence}%</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '999px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    background: item.result === 'DEEPFAKE' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: item.result === 'DEEPFAKE' ? 'var(--danger)' : 'var(--success)'
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
    </div>
  );
}
