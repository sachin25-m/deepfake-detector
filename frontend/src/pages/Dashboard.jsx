import React, { useState } from 'react';
import { Activity, ShieldAlert, ShieldCheck, Trash2, List, Search, Download } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredHistory = history.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedHistory = showAll ? filteredHistory : filteredHistory.slice(0, 7);

  const clearHistory = () => {
    setHistory([]);
    localStorage.setItem('scanHistory', JSON.stringify([]));
  };

  const totalScans = history.length;
  const deepfakeCount = history.filter(h => h.result === 'DEEPFAKE' || h.result === 'AI GENERATED').length;
  const authenticCount = totalScans - deepfakeCount;

  return (
    <div className="animate-slide-up" style={{ maxWidth: '1100px', margin: '0 auto', paddingTop: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>
            Analysis <span className="text-gradient">Dashboard & History</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Historical scan audit trail & forensic evidence log</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" style={{ padding: '0.65rem 1.25rem', borderRadius: '100px', fontSize: '0.85rem' }} onClick={() => setShowAll(!showAll)}>
            <List size={16} /> {showAll ? 'Show Recent' : 'Show All Logs'}
          </button>
          <button className="btn" style={{ padding: '0.65rem 1.25rem', borderRadius: '100px', fontSize: '0.85rem', background: 'rgba(255, 0, 60, 0.1)', color: 'var(--danger)', border: '1px solid rgba(255, 0, 60, 0.25)' }} onClick={clearHistory}>
            <Trash2 size={16} /> Clear History
          </button>
        </div>
      </div>
      
      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '20px' }}>
          <div style={{ padding: '1rem', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '16px', border: '1px solid var(--primary-glow)' }}>
            <Activity size={28} color="var(--primary)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Executed Scans</p>
            <h3 className="mono" style={{ fontSize: '1.9rem', fontWeight: '800' }}>{totalScans}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '20px' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 0, 60, 0.1)', borderRadius: '16px', border: '1px solid var(--danger-glow)' }}>
            <ShieldAlert size={28} color="var(--danger)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Deepfakes Detected</p>
            <h3 className="mono" style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--danger)' }}>{deepfakeCount}</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem', borderRadius: '20px' }}>
          <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '16px', border: '1px solid var(--success-glow)' }}>
            <ShieldCheck size={28} color="var(--success)" />
          </div>
          <div>
            <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Authentic Verifications</p>
            <h3 className="mono" style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--success)' }}>{authenticCount}</h3>
          </div>
        </div>
      </div>

      {/* Search & Audit Log Table */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.35rem', fontWeight: '700' }}>Historical Audit Trail</h3>
        
        {/* Search Box */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search filename or verdict..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.55rem 1rem 0.55rem 2.5rem',
              background: 'var(--btn-secondary-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '100px',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--btn-secondary-bg)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>File Identifier</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</th>
              <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {displayedHistory.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No matching scan history records found.</td>
              </tr>
            ) : (
              displayedHistory.map((item, idx) => {
                const isFake = item.result === 'DEEPFAKE' || item.result === 'AI GENERATED';
                return (
                  <tr key={item.id} style={{ borderBottom: idx !== displayedHistory.length - 1 ? '1px solid var(--glass-border)' : 'none', transition: 'background 0.2s' }}>
                    <td className="mono" style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.date}</td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: '500' }}>{item.name}</td>
                    <td className="mono" style={{ padding: '1rem 1.25rem', fontWeight: '600' }}>{item.confidence}%</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.85rem', 
                        borderRadius: '100px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        background: isFake ? 'rgba(255, 0, 60, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: isFake ? 'var(--danger)' : 'var(--success)',
                        border: `1px solid ${isFake ? 'rgba(255, 0, 60, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                      }}>
                        {item.result}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
