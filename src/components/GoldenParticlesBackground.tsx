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

export const GoldenParticlesBackground: React.FC = () => {
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

    // Floating gold leaf particles
    const particleCount = Math.max(28, Math.min(Math.floor((width * height) / 18000), 50));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const radius = Math.random() * 1.5 + 0.6;
      const maxOpacity = Math.random() * 0.4 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        speed: Math.random() * 0.35 + 0.15,
        opacity: Math.random() * maxOpacity,
        maxOpacity,
        swaySpeed: Math.random() * 0.012 + 0.004,
        swayAmp: Math.random() * 20 + 10,
        swayOffset: Math.random() * Math.PI * 2,
      });
    }

    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angle += 0.0008;

      // 1. Draw Architectural Haute Horlogerie Engine-Turned Guilloché Rings (Central Complication Hub)
      const centerX = width / 2;
      const centerY = Math.min(height * 0.38, 380);

      ctx.save();
      ctx.translate(centerX, centerY);

      // Outer Bezel Minute Rail
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 320, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(212, 175, 55, 0.06)';
      ctx.beginPath();
      ctx.arc(0, 0, 240, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Tourbillon / Escapement Gear Line Rings
      ctx.save();
      ctx.rotate(angle);

      // Fine gear teeth / graduation marks
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.05)';
      ctx.lineWidth = 1;
      const ticks = 60;
      for (let i = 0; i < ticks; i++) {
        const rad = (i * Math.PI * 2) / ticks;
        const innerR = i % 5 === 0 ? 222 : 230;
        const outerR = 240;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * innerR, Math.sin(rad) * innerR);
        ctx.lineTo(Math.cos(rad) * outerR, Math.sin(rad) * outerR);
        ctx.stroke();
      }

      // Three-Spoke Celestial Wheel
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.035)';
      ctx.lineWidth = 1.2;
      for (let s = 0; s < 3; s++) {
        const spokeRad = (s * Math.PI * 2) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(spokeRad) * 230, Math.sin(spokeRad) * 230);
        ctx.stroke();
      }

      ctx.restore();

      // Counter-rotating Inner Escapement Ring
      ctx.save();
      ctx.rotate(-angle * 1.5);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.045)';
      ctx.beginPath();
      ctx.arc(0, 0, 140, 0, Math.PI * 2);
      ctx.stroke();

      // Inner graduation teeth
      for (let i = 0; i < 36; i++) {
        const rad = (i * Math.PI * 2) / 36;
        const innerR = 132;
        const outerR = 140;
        ctx.beginPath();
        ctx.moveTo(Math.cos(rad) * innerR, Math.sin(rad) * innerR);
        ctx.lineTo(Math.cos(rad) * outerR, Math.sin(rad) * outerR);
        ctx.stroke();
      }
      ctx.restore();

      // Subtle Center Jewel Pivot
      ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 2. Draw Floating Gold Leaf Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        p.swayOffset += p.swaySpeed;

        const currentX = p.x + Math.sin(p.swayOffset) * p.swayAmp * 0.3;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.5)';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{ width: '100%', height: '100%' }}
    />
  );
};
