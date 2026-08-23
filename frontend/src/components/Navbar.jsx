import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Upload, History, Info, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
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
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Detect', icon: Upload },
    { path: '/dashboard', label: 'History', icon: History },
    { path: '/about', label: 'About', icon: Info },
  ];

  return (
    <nav className="glass-panel animate-slide-up navbar-container">
      
      {/* Brand Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#04070d',
          border: '1.5px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img src="/favicon.svg" alt="RealNetra" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            Real<span className="text-gradient">Netra</span>
          </span>
          <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--primary)', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
            FORENSIC AI HQ
          </span>
        </div>
      </Link>

      {/* Floating Nav Items */}
      <div className="nav-links">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`nav-link-item ${active ? 'active' : 'inactive'}`}
            >
              <item.icon size={15} />
              <span className="nav-link-text">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Theme Switcher Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label="Toggle Theme Mode"
          title={isDark ? "Switch to Light Mode" : "Switch to Cyber Dark Mode"}
        >
          {isDark ? <Sun size={16} color="var(--primary)" /> : <Moon size={16} color="var(--primary)" />}
        </button>
      </div>
    </nav>
  );
}
