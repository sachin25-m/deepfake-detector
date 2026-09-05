import React, { useState, useRef, useEffect } from 'react';

export default function ImageComparisonSlider({ 
  imageSrc = '/mountain_bg.jpg'
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 3) percentage = 3;
    if (percentage > 97) percentage = 97;
    setSliderPos(percentage);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '530px', margin: '0 auto' }}>
      
      {/* Top Left Handwritten Annotation: "Real or Fake?" */}
      <div style={{
        position: 'absolute',
        top: '-55px',
        left: '-10px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pointerEvents: 'none'
      }}>
        <span className="handwritten-annotation" style={{
          fontSize: '1.85rem',
          transform: 'rotate(-6deg)',
          fontWeight: 700,
          color: '#1e293b'
        }}>
          Real or Fake?
        </span>
        <svg width="45" height="30" viewBox="0 0 50 35" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '-4px', transform: 'rotate(10deg)' }}>
          <path d="M 8 4 Q 25 15 38 28 M 28 26 L 38 28 L 36 18" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Top Right Handwritten Annotation: "The truth is in the details." */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '-145px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        pointerEvents: 'none'
      }}>
        <span className="handwritten-annotation" style={{
          fontSize: '1.45rem',
          lineHeight: '1.15',
          transform: 'rotate(-4deg)',
          fontWeight: 700,
          color: '#1e293b'
        }}>
          The truth<br />is in the details.
        </span>
        <svg width="45" height="35" viewBox="0 0 50 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginTop: '4px', transform: 'rotate(-65deg) translate(-10px, 10px)' }}>
          <path d="M 6 32 Q 22 12 40 8 M 30 4 L 40 8 L 34 20" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Comparison Slider Frame */}
      <div 
        ref={containerRef}
        onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
        onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1.35',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.3), inset 0 0 0 1.5px rgba(255, 255, 255, 0.85)',
          cursor: 'ew-resize',
          userSelect: 'none',
          backgroundColor: '#0f172a'
        }}
      >
        {/* RIGHT SIDE: MANIPULATED IMAGE */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'contrast(1.15) brightness(0.9) saturate(1.2)'
        }}>
          {/* Pixelated Pixel Grid Overlay simulation */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: `
              repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 3px, transparent 3px, transparent 18px),
              repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 3px, transparent 3px, transparent 18px)
            `,
            mixBlendMode: 'overlay'
          }} />

          {/* Glitch / Pixel Blur Overlay */}
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backdropFilter: 'contrast(120%) blur(0.6px)',
            opacity: 0.8
          }} />

          {/* MANIPULATED Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#FEE2E2',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#991B1B',
            padding: '6px 14px',
            borderRadius: '100px',
            fontSize: '0.75rem',
            fontWeight: '800',
            letterSpacing: '0.06em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
            zIndex: 3
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }} />
            MANIPULATED
          </div>
        </div>

        {/* LEFT SIDE: REAL IMAGE */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: `${sliderPos}%`,
          overflow: 'hidden',
          zIndex: 2
        }}>
          <div style={{
            position: 'absolute',
            top: 0, left: 0,
            width: containerRef.current ? `${containerRef.current.clientWidth}px` : '530px',
            height: '100%',
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {/* REAL Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '16px',
              background: '#FFFFFF',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              color: '#0F172A',
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '0.06em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
              zIndex: 3
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
              REAL
            </div>
          </div>
        </div>

        {/* SLIDER DIVIDER LINE & HANDLE (< > Button) */}
        <div style={{
          position: 'absolute',
          top: 0, bottom: 0,
          left: `${sliderPos}%`,
          transform: 'translateX(-50%)',
          width: '2px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 0 8px rgba(0, 0, 0, 0.4)',
          zIndex: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0066FF',
            fontWeight: '800',
            fontSize: '0.82rem',
            letterSpacing: '-0.12em',
            paddingRight: '1px'
          }}>
            &lt;&gt;
          </div>
        </div>

      </div>
    </div>
  );
}

