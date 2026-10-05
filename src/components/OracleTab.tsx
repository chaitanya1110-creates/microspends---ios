import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Compass, ShieldAlert, CheckCircle2, ArrowRight, RefreshCw, Send } from 'lucide-react';
import { AdvisorInsight, Transaction, Subscription } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

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
  onUpdateInsight,
  transactions,
  subscriptions,
  currency,
  soundEnabled,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gaugeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Draw Golden Corona Score Gauge
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

    // Track arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Active Golden Arc
    const scoreFraction = Math.max(0, Math.min(100, insight.score)) / 100;
    const activeEndAngle = startAngle + totalAngle * scoreFraction;

    const grad = ctx.createLinearGradient(0, height, width, 0);
    grad.addColorStop(0, '#D4AF37');
    grad.addColorStop(0.5, '#F59E0B');
    grad.addColorStop(1, '#10B981');

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, activeEndAngle);
    ctx.lineWidth = 14;
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Score text in center
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${insight.score}`, centerX, centerY - 6);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 12px Cinzel';
    ctx.fillText(`GRADE ${insight.grade}`, centerX, centerY + 18);
  }, [insight.score, insight.grade]);

  // 2. Draw Spending Leakages Radar Pentagon
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
    const radius = Math.min(width, height) * 0.38;

    const axes = [
      { label: 'Discretionary', val: insight.leakageBreakdown?.discretionary || 75 },
      { label: 'Subscriptions', val: insight.leakageBreakdown?.subscriptions || 85 },
      { label: 'Dining Out', val: insight.leakageBreakdown?.dining || 65 },
      { label: 'Spend Variance', val: insight.leakageBreakdown?.variance || 90 },
      { label: 'Discipline', val: insight.leakageBreakdown?.discipline || 85 },
    ];

    const numAxes = axes.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Draw concentric polygon webs
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach((lvl) => {
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * lvl);
        const y = centerY + Math.sin(angle) * (radius * lvl);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw axis lines and labels
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const labelX = centerX + Math.cos(angle) * (radius + 16);
      const labelY = centerY + Math.sin(angle) * (radius + 16);
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i].label, labelX, labelY);
    }

    // Draw data polygon
    ctx.beginPath();
    axes.forEach((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (axis.val / 100) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.fill();

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Data points
    axes.forEach((axis, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const r = (axis.val / 100) * radius;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
    });
  }, [insight.leakageBreakdown]);

  // Ask wealth advisor via Gemini API
  const handleAskAdvisor = async (promptText?: string) => {
    const textToQuery = promptText || query;
    if (!textToQuery.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const financialContext = {
        totalTransactions: transactions.length,
        totalDebited: transactions
          .filter((t) => t.type === 'debit')
          .reduce((a, b) => a + b.amount, 0),
        totalCredited: transactions
          .filter((t) => t.type === 'credit')
          .reduce((a, b) => a + b.amount, 0),
        recentTransactions: transactions.slice(0, 10),
        activeSubscriptions: subscriptions.map((s) => ({
          name: s.name,
          amount: s.amount,
          cycle: s.billingCycle,
        })),
      };

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery: textToQuery, financialContext }),
      });

      if (!res.ok) throw new Error('Advisor consultation failed');
      const data = await res.json();

      onUpdateInsight({
        score: data.score || 85,
        grade: data.grade || 'A',
        headline: data.headline || 'Audit Complete',
        summary: data.summary || '',
        leakageBreakdown: data.leakageBreakdown || insight.leakageBreakdown,
        recommendations: data.recommendations || [],
        actionItems: data.actionItems || [],
        updatedAt: new Date().toISOString(),
      });

      if (soundEnabled) soundFx.goldChime();
      triggerHaptic('success');
      setQuery('');
    } catch (err: any) {
      console.error(err);
      setError('Oracle connection paused. Tap retry or check your network.');
      if (soundEnabled) soundFx.deleteDrop();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Top Hero: Golden Corona Health Gauge & Leakage Radar */}
      <div className="rounded-2xl p-4 liquid-glass-card rgb-border-subtle shadow-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
              Delphic Financial Health Audit
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">
            Updated {new Date(insight.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Gauge */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-cinzel font-bold text-zinc-400 uppercase tracking-wider mb-1">
              Equilibrium Index
            </span>
            <div className="w-44 h-36">
              <canvas ref={gaugeCanvasRef} className="w-full h-full" />
            </div>
            <span className="text-[11px] font-mono text-amber-300 font-medium">
              Top 8% of Discretionary Savers
            </span>
          </div>

          {/* Radar Pentagon */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-cinzel font-bold text-zinc-400 uppercase tracking-wider mb-1">
              5-Axis Leakage Radar
            </span>
            <div className="w-48 h-36">
              <canvas ref={radarCanvasRef} className="w-full h-full" />
            </div>
            <span className="text-[10px] text-zinc-400">
              Discretionary • Subscriptions • Dining
            </span>
          </div>
        </div>

        {/* Oracle Summary Headline */}
        <div className="mt-4 pt-3 border-t border-white/[0.08]">
          <h4 className="font-cinzel text-xs font-bold text-amber-100 mb-1">
            {insight.headline}
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
            {insight.summary}
          </p>
        </div>
      </div>

      {/* 2. Interactive Wealth Advisor Query Bar */}
      <div className="rounded-2xl p-4 liquid-glass-card shadow-xl border border-white/[0.08]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-cinzel font-bold">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Consult the Delphic Wealth Advisor</span>
          </div>
          {isLoading && (
            <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Auditing Ledger...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskAdvisor();
            }}
            placeholder="Ask Oracle: 'How can I save 15% this month?'"
            className="flex-1 bg-black/60 border border-amber-500/20 rounded-xl py-2.5 px-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400/80 transition font-sans"
            disabled={isLoading}
          />
          <button
            onClick={() => handleAskAdvisor()}
            disabled={!query.trim() || isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs disabled:opacity-40 transition flex items-center gap-1 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {error && (
          <p className="text-[11px] text-rose-400 mt-2 font-mono">{error}</p>
        )}

        {/* Quick prompt chips */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[10px]">
          <span className="text-zinc-500 font-mono">Prompts:</span>
          {[
            'Audit discretionary spending leaks',
            'Where can I save 15% this month?',
            'Optimize my Vault subscriptions',
            'How is my daily spend variance?',
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                handleAskAdvisor(prompt);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-300 hover:border-amber-500/30 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Tactical Recommendations & Action Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Recommendations */}
        <div className="rounded-2xl p-4 bg-[#030a05]/90 border border-amber-500/20 shadow-lg space-y-2.5">
          <div className="flex items-center gap-1.5 text-amber-300 font-cinzel text-xs font-bold uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tactical Recommendations</span>
          </div>

          <div className="space-y-2">
            {insight.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 leading-snug">
                <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="rounded-2xl p-4 bg-[#030a05]/90 border border-cyan-500/20 shadow-lg space-y-2.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-cinzel text-xs font-bold uppercase">
            <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            <span>Actionable Next Steps</span>
          </div>

          <div className="space-y-2">
            {insight.actionItems.map((act, i) => (
              <div key={i} className="p-2 rounded-xl bg-black/40 border border-zinc-800/80 text-xs text-zinc-300 flex items-center justify-between">
                <span>{act}</span>
                <span className="w-4 h-4 rounded-full border border-zinc-700 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
