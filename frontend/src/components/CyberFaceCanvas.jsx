import React, { useEffect, useRef } from 'react';

export default function CyberFaceCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Mouse parallax tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let rotY = 0;
    let rotX = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      targetRotY = (x / rect.width) * 0.8;
      targetRotX = (-y / rect.height) * 0.8;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 500;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 3D Facial Point-Cloud Definition (Normalized 3D coordinates -1 to 1)
    const baseFacePoints = [];
    
    // Head Contour Ellipsoid
    for (let i = 0; i < 40; i++) {
      const theta = (i / 40) * Math.PI * 2;
      baseFacePoints.push({ x: 0.65 * Math.cos(theta), y: 0.9 * Math.sin(theta), z: 0.2 * Math.cos(theta), type: 'contour' });
    }

    // Inner Face Grid (Eye sockets, Nose, Mouth, Cheeks)
    // Eyes
    for (let r = 0; r < Math.PI * 2; r += Math.PI / 6) {
      baseFacePoints.push({ x: -0.25 + 0.12 * Math.cos(r), y: -0.2 + 0.08 * Math.sin(r), z: 0.25, type: 'eye' });
      baseFacePoints.push({ x: 0.25 + 0.12 * Math.cos(r), y: -0.2 + 0.08 * Math.sin(r), z: 0.25, type: 'eye' });
    }

    // Nose bridge & tip
    baseFacePoints.push({ x: 0, y: -0.2, z: 0.35, type: 'nose' });
    baseFacePoints.push({ x: 0, y: -0.05, z: 0.42, type: 'nose' });
    baseFacePoints.push({ x: 0, y: 0.1, z: 0.48, type: 'nose' });
    baseFacePoints.push({ x: -0.08, y: 0.15, z: 0.38, type: 'nose' });
    baseFacePoints.push({ x: 0.08, y: 0.15, z: 0.38, type: 'nose' });

    // Lips / Mouth
    for (let r = 0; r < Math.PI * 2; r += Math.PI / 8) {
      baseFacePoints.push({ x: 0.22 * Math.cos(r), y: 0.42 + 0.1 * Math.sin(r), z: 0.3 + 0.05 * Math.cos(r), type: 'mouth' });
    }

    // Cheekbones & Jawline
    for (let y = -0.5; y <= 0.7; y += 0.15) {
      for (let x = -0.55; x <= 0.55; x += 0.22) {
        if (Math.abs(x) > 0.1 || y < -0.1) {
          const z = 0.35 * (1 - Math.hypot(x, y) * 0.7);
          baseFacePoints.push({ x, y, z, type: 'mesh' });
        }
      }
    }

    // Laser Beam Scan Position
    let laserY = -1.2;
    let laserDirection = 1;

    // Animation Loop (60 FPS)
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.42;

      // Smooth interpolation for parallax rotation
      rotY += (targetRotY - rotY) * 0.05;
      rotX += (targetRotX - rotX) * 0.05;

      const autoRotateY = Math.sin(time * 0.5) * 0.25 + rotY;
      const autoRotateX = Math.cos(time * 0.3) * 0.1 + rotX;

      // Laser sweep position update
      laserY += 0.012 * laserDirection;
      if (laserY > 1.2) laserDirection = -1;
      if (laserY < -1.2) laserDirection = 1;

      // Draw background cybernetic dot grid
      ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
      for (let gx = -width / 2; gx < width / 2; gx += 40) {
        for (let gy = -height / 2; gy < height / 2; gy += 40) {
          if ((gx + gy) % 80 === 0) {
            ctx.beginPath();
            ctx.arc(cx + gx, cy + gy, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Transform & Project 3D Face Points
      const projectedPoints = [];
      const cosY = Math.cos(autoRotateY);
      const sinY = Math.sin(autoRotateY);
      const cosX = Math.cos(autoRotateX);
      const sinX = Math.sin(autoRotateX);

      for (let i = 0; i < baseFacePoints.length; i++) {
        const p = baseFacePoints[i];

        // 3D Y Rotation
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;

        // 3D X Rotation
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = p.y * sinX + z1 * cosX;

        // Perspective Projection
        const fov = 3.5;
        const perspective = fov / (fov + z2);
        const px = cx + x1 * scale * perspective;
        const py = cy + y2 * scale * perspective;

        projectedPoints.push({ px, py, pz: z2, origY: p.y, type: p.type });
      }

      // Draw 3D Wireframe Connectors between nearby points
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projectedPoints.length; i++) {
        const p1 = projectedPoints[i];
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p2 = projectedPoints[j];
          const dist = Math.hypot(p1.px - p2.px, p1.py - p2.py);

          if (dist < scale * 0.22) {
            const alpha = Math.max(0, (1 - dist / (scale * 0.22))) * 0.25;

            // Highlight connections near the laser beam
            const nearLaser = Math.abs(p1.origY - laserY) < 0.15;
            ctx.strokeStyle = nearLaser ? `rgba(16, 185, 129, ${alpha * 2})` : `rgba(6, 182, 212, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw Particle Nodes
      for (let i = 0; i < projectedPoints.length; i++) {
        const p = projectedPoints[i];
        const isNearLaser = Math.abs(p.origY - laserY) < 0.12;

        let radius = 2;
        let color = 'rgba(6, 182, 212, 0.7)';

        if (p.type === 'eye' || p.type === 'nose') {
          radius = 3;
          color = 'rgba(34, 211, 238, 0.9)';
        }

        if (isNearLaser) {
          radius = 4;
          color = '#10b981'; // Laser highlight emerald green
        }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow ring around laser hit points
        if (isNearLaser) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(p.px, p.py, radius + 3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw Vertical Laser Scanning Beam Sweep
      const laserScreenY = cy + laserY * scale;
      const laserGradient = ctx.createLinearGradient(cx - scale * 0.8, laserScreenY, cx + scale * 0.8, laserScreenY);
      laserGradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
      laserGradient.addColorStop(0.3, 'rgba(16, 185, 129, 0.4)');
      laserGradient.addColorStop(0.5, 'rgba(0, 240, 255, 0.95)');
      laserGradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
      laserGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');

      ctx.strokeStyle = laserGradient;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(cx - scale * 0.85, laserScreenY);
      ctx.lineTo(cx + scale * 0.85, laserScreenY);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset glow shadow

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none'
      }}
    />
  );
}
