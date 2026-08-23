import React from 'react';

export default function ConfidenceGauge({ confidence = 94.2, resultLabel = 'DEEPFAKE', isFake = true }) {
  const radius = 54;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  const colorGradientId = isFake ? 'dangerRing' : 'successRing';
  const mainColor = isFake ? '#f43f5e' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <svg height={radius * 2} width={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="dangerRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <linearGradient id="successRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Track Background Ring */}
        <circle
          stroke="rgba(255, 255, 255, 0.08)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress Arc Ring */}
        <circle
          stroke={`url(#${colorGradientId})`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      {/* Center Percentage Display */}
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span className="mono" style={{ fontSize: '1.4rem', fontWeight: 800, color: mainColor, lineHeight: 1 }}>
          {confidence}%
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', letterSpacing: '0.08em', marginTop: '2px', fontWeight: 600 }}>
          CONFIDENCE
        </span>
      </div>
    </div>
  );
}
