import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  maxOpacity: number;
  swaySpeed: number;
  swayAmp: number;
  swayOffset: number;
}

export const DynamicHueBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setSize();

    // Subtle drifting luminescence particles
    const particleCount = Math.max(20, Math.min(Math.floor((width * height) / 22000), 40));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 1.4 + 0.5;
      const maxOpacity = Math.random() * 0.35 + 0.1;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * maxOpacity,
        maxOpacity,
        swaySpeed: Math.random() * 0.01 + 0.003,
        swayAmp: Math.random() * 18 + 8,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angle += 0.0006;

      // 1. Subtle Precision Chronometer Guilloché Gear Ring at Center
      const centerX = width / 2;
      const centerY = Math.min(height * 0.35, 360);

      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer Bezel Rail
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 300, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.beginPath();
      ctx.arc(0, 0, 220, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Chronometer Wheel
      ctx.save();
      ctx.rotate(angle);

      const ticks = 48;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      for (let i = 0; i < ticks; i++) {
        const rad = (i * Math.PI * 2) / ticks;
        const innerR = i % 4 === 0 ? 205 : 212;
        const outerR = 220;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * innerR, Math.sin(rad) * innerR);
        ctx.lineTo(Math.cos(rad) * outerR, Math.sin(rad) * outerR);
        ctx.stroke();
      }

      ctx.restore();
      ctx.restore();

      // 2. Ambient Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        p.swayOffset += p.swaySpeed;

        const currentX = p.x + Math.sin(p.swayOffset) * p.swayAmp * 0.3;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(255, 235, 170, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      setSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030406]">
      {/* Dynamic Animated Changing Hue Color Panel */}
      <div className="absolute inset-0 changing-hue-container opacity-85 pointer-events-none">
        {/* Floating Organic Aurora Mesh Orb 1 */}
        <div className="absolute -top-[15%] -left-[10%] w-[70vw] max-w-[650px] h-[70vw] max-h-[650px] rounded-full bg-gradient-to-br from-[#6366f1]/35 via-[#a855f7]/25 to-transparent blur-[80px] animate-hue-drift-1 pointer-events-none" />

        {/* Floating Organic Aurora Mesh Orb 2 */}
        <div className="absolute top-[25%] -right-[15%] w-[65vw] max-w-[600px] h-[65vw] max-h-[600px] rounded-full bg-gradient-to-bl from-[#ec4899]/30 via-[#f59e0b]/25 to-transparent blur-[90px] animate-hue-drift-2 pointer-events-none" />

        {/* Floating Organic Aurora Mesh Orb 3 */}
        <div className="absolute -bottom-[20%] left-[15%] w-[75vw] max-w-[700px] h-[75vw] max-h-[700px] rounded-full bg-gradient-to-tr from-[#3b82f6]/35 via-[#06b6d4]/20 to-transparent blur-[100px] animate-hue-drift-3 pointer-events-none" />

        {/* Central Luminous Core */}
        <div className="absolute top-[15%] left-[50%] -translate-x-1/2 w-[50vw] max-w-[480px] h-[50vw] max-h-[480px] rounded-full bg-gradient-to-r from-[#eab308]/20 via-[#f43f5e]/20 to-[#8b5cf6]/25 blur-[70px] animate-hue-pulse pointer-events-none" />
      </div>

      {/* Subtle Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

      {/* Horology Geometric Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};
