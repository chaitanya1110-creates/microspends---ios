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

    // Subtle luminous warm golden tones
    const goldPalettes = [
      '#FFDF73', // Bright Gold
      '#F59E0B', // Amber Gold
      '#FCD34D', // Shimmer Gold
      '#E6C665', // Champagne Gold
      '#D4AF37', // Imperial Gold
    ];

    // Determine particle count based on screen size for optimal density
    const particleCount = Math.max(38, Math.min(Math.floor((width * height) / 14000), 75));
    const particles: Particle[] = [];

    const createParticle = (initialY?: number): Particle => {
      const radius = Math.random() * 1.8 + 0.8; // 0.8px to 2.6px
      const maxOpacity = Math.random() * 0.55 + 0.35; // 0.35 to 0.90
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height,
        radius,
        speed: Math.random() * 0.55 + 0.3, // Steady graceful upward float
        opacity: Math.random() * maxOpacity,
        maxOpacity,
        swaySpeed: Math.random() * 0.018 + 0.006,
        swayAmp: Math.random() * 30 + 15,
        swayOffset: Math.random() * Math.PI * 2,
        color: goldPalettes[Math.floor(Math.random() * goldPalettes.length)],
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

      // Render flowing golden dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move upward from below to up
        p.y -= p.speed;

        // Subtle natural horizontal swaying
        const swayX = Math.sin(time * p.swaySpeed + p.swayOffset) * (p.swayAmp * 0.05);
        const currentX = p.x + swayX;

        // Fade in near bottom, fade out near top
        if (p.y > height - 100) {
          p.opacity = Math.min(p.maxOpacity, p.opacity + 0.02);
        } else if (p.y < 120) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        // When particle moves above the top viewport, reset to bottom
        if (p.y < -10) {
          particles[i] = createParticle(height + Math.random() * 20);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);

        // Golden glow halo around larger dots
        if (p.radius > 1.3) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 6;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.opacity));
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Pause animation when tab is not active to save battery
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
      {/* Deep Obsidian Gradient Ambiance */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#040805] via-[#020503] to-[#010302] opacity-95" />
      
      {/* Soft warm golden ambient radial glows at top and bottom */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[500px] h-[350px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[450px] h-[250px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hardware-accelerated canvas for rising golden dots */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
};
