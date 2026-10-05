import React, { useEffect, useRef, useState } from 'react';
import { Transaction } from '../types';
import { Activity, Flame, TrendingUp } from 'lucide-react';

interface ChartsTabProps {
  transactions: Transaction[];
  currency: string;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({ transactions, currency }) => {
  const ringsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const splineCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Group debit transactions by category
  const debitTransactions = transactions.filter((t) => t.type === 'debit');
  const totalDebit = debitTransactions.reduce((acc, t) => acc + t.amount, 0) || 1;

  const categoryTotals: Record<string, number> = {};
  debitTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalDebit) * 100),
    }));

  const ringColors = [
    '#10B981', // Laurel Emerald
    '#D4AF37', // Imperial Gold
    '#F59E0B', // Amber
    '#A855F7', // Purple Amethyst
    '#F43F5E', // Solar Coral
  ];

  // 1. Draw Apple Activity-style Concentric Neon Rings
  useEffect(() => {
    const canvas = ringsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const size = rect.width;
    const centerX = size / 2;
    const centerY = size / 2;
    ctx.clearRect(0, 0, size, size);

    const maxRings = Math.min(5, sortedCategories.length);
    const strokeWidth = 10;
    const spacing = 15;
    const baseRadius = (size / 2) - 18;

    for (let i = 0; i < maxRings; i++) {
      const radius = baseRadius - (i * spacing);
      if (radius <= 0) break;

      const item = sortedCategories[i];
      const color = ringColors[i % ringColors.length];
      const fraction = Math.min(1, item.amount / totalDebit);
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (fraction * Math.PI * 2);

      // Track (dim background circle)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineCap = 'round';
      ctx.stroke();

      // Glowing active sweep arc
      if (fraction > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Center icon / percentage
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 16px Cinzel';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ICARUS', centerX, centerY - 8);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '10px monospace';
    ctx.fillText('RINGS', centerX, centerY + 10);
  }, [sortedCategories, totalDebit]);

  // 2. Draw Daily Spending Trend Bezier Spline
  useEffect(() => {
    const canvas = splineCanvasRef.current;
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

    // Aggregate spend by day for March (days 1 to 16)
    const dailyMap: Record<number, number> = {};
    for (let day = 1; day <= 16; day++) dailyMap[day] = 0;

    debitTransactions.forEach((t) => {
      const day = parseInt(t.date.split('-')[2], 10);
      if (day >= 1 && day <= 16) {
        dailyMap[day] = (dailyMap[day] || 0) + t.amount;
      }
    });

    const days = Object.keys(dailyMap).map(Number).sort((a, b) => a - b);
    const amounts = days.map((d) => dailyMap[d]);
    const maxAmount = Math.max(...amounts, 1000);

    const points: { x: number; y: number; day: number; amount: number }[] = days.map((d, idx) => {
      const x = (idx / (days.length - 1)) * (width - 40) + 20;
      const y = height - 25 - (amounts[idx] / maxAmount) * (height - 50);
      return { x, y, day: d, amount: amounts[idx] };
    });

    // Horizontal baseline
    ctx.beginPath();
    ctx.moveTo(10, height - 20);
    ctx.lineTo(width - 10, height - 20);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Area fill gradient
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, height - 20);
      ctx.lineTo(points[0].x, points[0].y);

      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, height - 20);
      ctx.closePath();

      const areaGrad = ctx.createLinearGradient(0, 0, 0, height);
      areaGrad.addColorStop(0, 'rgba(16, 185, 129, 0.20)');
      areaGrad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Spline Stroke
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Peak Dots & Callouts
      points.forEach((p) => {
        if (p.amount > maxAmount * 0.4) {
          // Highlight dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#D4AF37';
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Callout label
          ctx.fillStyle = '#F4F4F5';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`d${p.day}`, p.x, p.y - 8);
        }
      });
    }
  }, [debitTransactions]);

  return (
    <div className="space-y-4">
      {/* 1. Concentric Category Rings Card */}
      <div className="rounded-2xl p-4 bg-[#030a05] border border-zinc-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Category Distribution
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">Activity Rings</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
          {/* Canvas Rings */}
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <canvas ref={ringsCanvasRef} className="w-44 h-44" />
          </div>

          {/* Rings Legend */}
          <div className="w-full flex-1 space-y-2">
            {sortedCategories.slice(0, 5).map((cat, idx) => {
              const color = ringColors[idx % ringColors.length];
              return (
                <div key={cat.category} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                    <span className="text-zinc-200 truncate max-w-[120px]">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-zinc-400">{cat.percentage}%</span>
                    <span className="text-zinc-200 font-bold">
                      {currency}{cat.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Daily Spending Trend Bezier Spline */}
      <div className="rounded-2xl p-4 bg-[#030a05] border border-zinc-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Daily Spending Trend
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400">March 1 – 16</span>
        </div>

        <p className="text-xs text-zinc-400 mb-2">
          Daily expenditures curve with high-spend peak callouts.
        </p>

        <div className="w-full h-36 relative rounded-xl bg-black/40 border border-zinc-800/80 overflow-hidden">
          <canvas ref={splineCanvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* 3. Detailed Category Breakdown List */}
      <div className="rounded-2xl p-4 bg-[#030905]/90 border border-zinc-800 shadow-xl backdrop-blur-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
            All Category Allocations
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">
            Total Debit: {currency}{totalDebit.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2">
          {sortedCategories.map((cat, idx) => (
            <div key={cat.category} className="p-2.5 rounded-xl bg-black/40 border border-zinc-800/70">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-200 font-medium">{cat.category}</span>
                <span className="font-mono text-amber-300 font-bold">
                  {currency}{cat.amount.toLocaleString()} ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: ringColors[idx % ringColors.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
