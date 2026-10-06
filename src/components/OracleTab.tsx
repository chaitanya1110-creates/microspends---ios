import React, { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AdvisorInsight, Transaction, Subscription } from '../types';

interface OracleTabProps {
  insight: AdvisorInsight;
  onUpdateInsight: (insight: AdvisorInsight) => void;
  transactions: Transaction[];
  subscriptions: Subscription[];
  currency: string;
  soundEnabled: boolean;
}

export const OracleTab: React.FC<OracleTabProps> = ({
  insight,
  transactions,
  subscriptions,
}) => {
  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Draw Golden Corona Score Gauge (Haute Horlogerie Complication Dial)
  useEffect(() => {
    const canvas = gaugeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height * 0.58;
    const radius = Math.min(width, height) * 0.42;

    const startAngle = Math.PI * 0.8;
    const endAngle = Math.PI * 2.2;
    const totalAngle = endAngle - startAngle;

    // Track arc (engraved gold groove)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Active Golden/Platinum Arc
    const scoreFraction = Math.max(0, Math.min(100, insight.score)) / 100;
    const activeEndAngle = startAngle + totalAngle * scoreFraction;

    const grad = ctx.createLinearGradient(0, height, width, 0);
    grad.addColorStop(0, '#B8860B');
    grad.addColorStop(0.5, '#D4AF37');
    grad.addColorStop(1, '#FFF3C4');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, activeEndAngle);
    ctx.lineWidth = 10;
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Score text in center
    ctx.fillStyle = '#FFF3C4';
    ctx.font = 'bold 24px Helvetica Neue, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${insight.score}`, centerX, centerY - 6);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 9px Helvetica Neue, sans-serif';
    ctx.fillText(`GRADE ${insight.grade} · EQUILIBRIUM`, centerX, centerY + 16);
  }, [insight.score, insight.grade]);

  // 2. Draw Spending Leakages Radar Pentagon on Engine-Turned Spiderweb
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.38;

    const axes = [
      { name: 'Dining', key: 'dining' },
      { name: 'Vault', key: 'subscriptions' },
      { name: 'Discretionary', key: 'discretionary' },
      { name: 'Variance', key: 'variance' },
      { name: 'Discipline', key: 'discipline' },
    ];

    const numAxes = axes.length;

    // Concentric Web Polygons
    const levels = 4;
    for (let l = 1; l <= levels; l++) {
      const r = (maxRadius / levels) * l;
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axes
    for (let i = 0; i < numAxes; i++) {
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius);
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.18)';
      ctx.stroke();

      // Axis labels
      const labelDist = maxRadius + 14;
      const lx = centerX + Math.cos(angle) * labelDist;
      const ly = centerY + Math.sin(angle) * labelDist;
      ctx.fillStyle = '#D4AF37';
      ctx.font = '8px Helvetica Neue, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i].name, lx, ly);
    }

    // Values polygon
    const leakage = insight.leakageBreakdown || {
      dining: 65,
      subscriptions: 45,
      shopping: 70,
      utilities: 30,
      transport: 40,
    };

    ctx.beginPath();
    axes.forEach((axis, i) => {
      const val = Math.min(100, Math.max(10, (leakage as any)[axis.key] || 50));
      const r = (maxRadius * val) / 100;
      const angle = (Math.PI * 2 * i) / numAxes - Math.PI / 2;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [insight.leakageBreakdown]);

  return (
    <div className="space-y-4">
      {/* 1. Top Hero: Private Wealth Audit Dossier */}
      <div className="rounded-2xl p-4 horology-bezel shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15 mb-2">
          <div className="flex items-center gap-2">
            <span className="ruby-bearing" />
            <h3 className="font-sans text-xs font-bold text-[#E5C378] uppercase tracking-wider">
              Delphic Oracle · AI Financial Intelligence
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#D4AF37]/70">
            {new Date(insight.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#E5C378] mb-1">
              Financial Health Index
            </span>
            <div className="w-44 h-36">
              <canvas ref={gaugeCanvasRef} className="w-full h-full" />
            </div>
            <span className="text-[11px] font-sans text-[#F5D478]">
              Active Solvency Rating
            </span>
          </div>

          {/* Radar Pentagon */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-sans uppercase tracking-widest text-[#E5C378] mb-1">
              5-Axis Spending Radar
            </span>
            <div className="w-48 h-36">
              <canvas ref={radarCanvasRef} className="w-full h-full" />
            </div>
            <span className="text-[10px] font-sans text-zinc-400">
              Dining · Vault · Discretionary · Variance · Discipline
            </span>
          </div>
        </div>

        {/* Oracle Summary Headline */}
        <div className="mt-4 pt-3 border-t border-[#D4AF37]/15">
          <h4 className="font-sans text-sm font-bold text-[#FFF3C4] mb-1">
            {insight.headline}
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {insight.summary}
          </p>
        </div>
      </div>

      {/* 2. Action Directives List */}
      {insight.actionItems && insight.actionItems.length > 0 && (
        <div className="rounded-2xl p-4 horology-bezel shadow-xl space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15">
            <h4 className="font-sans text-xs font-bold text-[#E5C378] uppercase tracking-wider">
              Immediate Action Directives
            </h4>
            <span className="text-[10px] font-mono text-[#D4AF37]/70">
              {insight.actionItems.length} recommendations
            </span>
          </div>

          <div className="space-y-2">
            {insight.actionItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-gradient-to-b from-[#101512] to-[#070A08] border border-[#D4AF37]/20 flex items-start gap-2.5"
              >
                <div className="w-5 h-5 rounded-md bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#F5D478] shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-sans text-zinc-200 leading-relaxed">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
