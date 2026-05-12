import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Upload, History, Info, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
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
    <nav className="glass-panel animate-slide-up navbar-container" style={{ alignItems: 'center' }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div style={{
          display: 'flex',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: '0 0 20px var(--primary-glow)',
          width: '46px',
          height: '46px'
        }}>
          <img src="/logo.jpg" alt="RealNetra Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>RealNetra</span>
      </Link>

      <div className="nav-links">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`nav-link-item ${active ? 'active' : 'inactive'}`}
            >
              <item.icon size={18} />
              <span className="nav-link-text">{item.label}</span>
            </Link>
          );
        })}
        
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="theme-toggle"
          aria-label="Toggle Dark Mode"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
