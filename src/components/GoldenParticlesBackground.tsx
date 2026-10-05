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
  color: string;
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

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Luminous warm golden tones with delicate minimal RGB spectrum
    const palettes = [
      '#FFDF73', // Bright Gold
      '#F59E0B', // Amber Gold
      '#FCD34D', // Shimmer Gold
      '#D4AF37', // Imperial Gold
      '#34D399', // Subtle Emerald Glow
      '#38BDF8', // Subtle Cyan Glow
      '#C084FC', // Subtle Amethyst Glow
    ];

    // Determine particle count based on screen size
    const particleCount = Math.max(36, Math.min(Math.floor((width * height) / 15000), 65));
    const particles: Particle[] = [];

    const createParticle = (initialY?: number): Particle => {
      const radius = Math.random() * 1.6 + 0.8;
      const maxOpacity = Math.random() * 0.45 + 0.25;
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height,
        radius,
        speed: Math.random() * 0.45 + 0.25,
        opacity: Math.random() * maxOpacity,
        maxOpacity,
        swaySpeed: Math.random() * 0.016 + 0.005,
        swayAmp: Math.random() * 25 + 12,
        swayOffset: Math.random() * Math.PI * 2,
        color: palettes[Math.floor(Math.random() * palettes.length)],
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Render floating subtle dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y -= p.speed;

        const swayX = Math.sin(time * p.swaySpeed + p.swayOffset) * (p.swayAmp * 0.04);
        const currentX = p.x + swayX;

        if (p.y > height - 100) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.02);
        } else if (p.y < 120) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        if (p.y < -10) {
          particles[i] = createParticle(height + Math.random() * 20);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);

        if (p.radius > 1.2) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 5;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else {
        cancelAnimationFrame(animationFrameId);
        render();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Deep Obsidian Background */}
      <div className="absolute inset-0 bg-[#020403] opacity-98" />
      
      {/* Delicate Minimal RGB Aurora Ambient Radiance */}
      <div className="absolute -top-32 -left-20 w-[420px] h-[320px] bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-24 w-[380px] h-[340px] bg-gradient-to-bl from-purple-500/8 via-pink-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-[480px] h-[300px] bg-gradient-to-t from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Hardware-accelerated canvas for rising luminous particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
