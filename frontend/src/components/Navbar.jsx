import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/upload', label: 'Detect' },
    { path: '/dashboard', label: 'History' },
    { path: '/about', label: 'About' },
  ];

  return (
    <nav className="navbar-container" style={{
      position: 'fixed',
      top: '1.25rem',
      left: '0',
      right: '0',
      margin: '0 auto',
      width: 'calc(100% - 3rem)',
      maxWidth: '1080px',
      zIndex: 50,
      padding: '0.6rem 1.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '100px',
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)'
    }}>
      
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: '#04070d',
          border: '1.5px solid #0066FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img src="/favicon.svg" alt="RealNetra" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Real<span style={{ color: '#0066FF' }}>Netra</span>
          </span>
          <span className="mono" style={{ fontSize: '0.58rem', color: '#0066FF', letterSpacing: '0.12em', fontWeight: 800, textTransform: 'uppercase' }}>
            FORENSIC AI HQ
          </span>
        </div>
      </Link>

      {/* Floating Center Nav Items (Clean Text Pills) */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              style={{
                textDecoration: 'none',
                fontWeight: active ? '700' : '500',
                fontSize: '0.92rem',
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                color: active ? '#0066FF' : '#334155',
                backgroundColor: active ? 'rgba(0, 102, 255, 0.12)' : 'transparent'
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Theme Switcher Circular Button */}
      <button 
        onClick={toggleTheme} 
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
        aria-label="Toggle Theme Mode"
      >
        {isDark ? <Sun size={17} color="#0066FF" /> : <Moon size={17} color="#1e293b" />}
      </button>
    </nav>
  );
}
