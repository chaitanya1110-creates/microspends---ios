import React, { useEffect, useRef } from 'react';
import { Transaction } from '../types';
import { Compass, TrendingUp, Sparkles, PieChart } from 'lucide-react';
import { isDateInMonth } from '../utils/storage';

interface ChartsTabProps {
  transactions: Transaction[];
  currency: string;
  currentMonth?: string;
}

export const ChartsTab: React.FC<ChartsTabProps> = ({ 
  transactions, 
  currency, 
  currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
}) => {
  const ringsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const splineCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Group debit transactions strictly for the active month
  const monthTransactions = transactions.filter((t) => isDateInMonth(t.date, currentMonth));
  const debitTransactions = monthTransactions.filter((t) => t.type === 'debit');
  const totalDebit = debitTransactions.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotals: Record<string, number> = {};
  debitTransactions.forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalDebit > 0 ? Math.round((amount / totalDebit) * 100) : 0,
    }));

  const ringColors = [
    '#D4AF37', // 18k Champagne Gold
    '#E5C378', // Warm Gold
    '#F59E0B', // Warm Amber
    '#38BDF8', // Cyan Rhodium
    '#F43F5E', // Ruby Rose
  ];

  // 1. Draw Haute Horlogerie Concentric Astrolabe Rings
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

    // Draw background concentric engine-turned rings
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let r = 25; r <= 80; r += 15) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const maxRings = Math.min(5, sortedCategories.length);
    const strokeWidth = 9;
    const spacing = 13;
    const baseRadius = (size / 2) - 16;

    if (totalDebit > 0 && maxRings > 0) {
      for (let i = 0; i < maxRings; i++) {
        const radius = baseRadius - (i * spacing);
        if (radius <= 0) break;

        const item = sortedCategories[i];
        const color = ringColors[i % ringColors.length];
        const fraction = totalDebit > 0 ? Math.min(1, item.amount / totalDebit) : 0;
        const startAngle = -Math.PI / 2;
        const endAngle = startAngle + (fraction * Math.PI * 2);

        // Track
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Active sweep arc
        if (fraction > 0) {
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.lineWidth = strokeWidth;
          ctx.strokeStyle = color;
          ctx.lineCap = 'round';
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
    } else {
      // Empty placeholder ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
      ctx.stroke();
    }

    // Center jewel pivot
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F43F5E';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }, [sortedCategories, totalDebit]);

  // 2. Draw Spending Trend Bezier Spline on Guilloché Background
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

    const w = rect.width;
    const h = rect.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle guilloché grid lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    const gridY = [h * 0.25, h * 0.5, h * 0.75];
    gridY.forEach((y) => {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    });

    const monthParts = (currentMonth || '').split(' ');
    const monthIndex = new Date(`${monthParts[0]} 1, ${monthParts[1] || 2026}`).getMonth();
    const yearNumber = parseInt(monthParts[1], 10) || new Date().getFullYear();
    const daysInMonth = isNaN(monthIndex) ? 31 : new Date(yearNumber, monthIndex + 1, 0).getDate();

    const dailySpending = new Array(daysInMonth).fill(0);
    debitTransactions.forEach((t) => {
      const parts = t.date.split('-');
      if (parts.length === 3) {
        const txYear = parseInt(parts[0], 10);
        const txMonth = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (!isNaN(monthIndex) && txMonth === monthIndex && txYear === yearNumber) {
          if (day >= 1 && day <= daysInMonth) {
            dailySpending[day - 1] += t.amount;
          }
        }
      }
    });

    const maxAmount = Math.max(...dailySpending, 10);
    const points = dailySpending.map((amt, idx) => ({
      x: (idx / (daysInMonth - 1)) * (w - 32) + 16,
      y: h - 24 - (amt / maxAmount) * (h - 48),
      amount: amt,
      day: idx + 1,
    }));

    if (points.length > 1) {
      // Area gradient
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.lineTo(points[points.length - 1].x, h);
      ctx.lineTo(points[0].x, h);
      ctx.closePath();

      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, 'rgba(212, 175, 55, 0.25)');
      gradient.addColorStop(0.5, 'rgba(229, 195, 120, 0.1)');
      gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();

      // Stroke curve
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 2;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Peak Dots & Callouts
      points.forEach((p) => {
        if (p.amount > 0 && p.amount >= maxAmount * 0.35) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#F5D478';
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#FFF3C4';
          ctx.font = 'bold 8px Helvetica Neue, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`D${p.day}`, p.x, p.y - 7);
        }
      });
    }
  }, [debitTransactions, currentMonth]);

  return (
    <div className="space-y-4">
      {/* 1. Concentric Category Astrolabe Rings Card */}
      <div className="rounded-2xl p-4 horology-bezel shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15 mb-2">
          <div className="flex items-center gap-2">
            <span className="ruby-bearing" />
            <h3 className="font-sans text-xs font-bold text-[#E5C378] uppercase tracking-wider">
              Spending Category Spheres
            </h3>
          </div>
          <span className="text-[10px] font-sans text-[#D4AF37]/70 uppercase tracking-widest">
            {currentMonth}
          </span>
        </div>

        {debitTransactions.length === 0 ? (
          <div className="py-8 text-center">
            <PieChart className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-2" />
            <p className="text-xs font-sans text-zinc-300">No expenses recorded for {currentMonth}.</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Logged expenses will populate the visual astrolabe rings.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
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
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                      />
                      <span className="text-zinc-200 font-sans text-xs truncate max-w-[120px]">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]">
                      <span className="text-zinc-400">{cat.percentage}%</span>
                      <span className="text-[#F5D478] font-bold">
                        {currency}{cat.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Daily Spending Trend Bezier Spline */}
      <div className="rounded-2xl p-4 horology-bezel shadow-xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15 mb-2">
          <div className="flex items-center gap-2">
            <span className="ruby-bearing" />
            <h3 className="font-sans text-xs font-bold text-[#E5C378] uppercase tracking-wider">
              Daily Spending Curve
            </h3>
          </div>
          <span className="text-[11px] font-sans text-[#F5D478] uppercase tracking-wider">{currentMonth}</span>
        </div>

        <p className="text-[11px] font-sans text-zinc-400 mb-2">
          Real outflow timeline showing daily velocity and peaks.
        </p>

        <div className="w-full h-36 relative rounded-xl bg-black/60 border border-[#D4AF37]/20 overflow-hidden">
          <canvas ref={splineCanvasRef} className="w-full h-full" />
        </div>
      </div>

      {/* 3. Detailed Category Breakdown List */}
      {sortedCategories.length > 0 && (
        <div className="rounded-2xl p-4 horology-bezel shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15">
            <h3 className="font-sans text-xs font-bold text-[#E5C378] uppercase tracking-wider">
              Total Spend Allocation
            </h3>
            <span className="text-[10px] font-mono text-zinc-400">
              Total Outflow: {currency}{totalDebit.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2">
            {sortedCategories.map((cat, idx) => (
              <div key={cat.category} className="p-2.5 rounded-xl bg-gradient-to-b from-[#101512] to-[#070A08] border border-[#D4AF37]/20">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-zinc-200 font-sans font-medium">{cat.category}</span>
                  <span className="font-sans text-[#F5D478] font-bold">
                    {currency}{cat.amount.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1 bg-black/80 rounded-full overflow-hidden border border-[#D4AF37]/20">
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
      )}
    </div>
  );
};
