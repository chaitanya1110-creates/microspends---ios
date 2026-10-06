import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface HeroBalanceCardProps {
  totalCredited: number;
  totalDebited: number;
  netBalance: number;
  currency: string;
  transactionCount: number;
  currentMonth?: string;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  totalCredited,
  totalDebited,
  netBalance,
  currency,
  transactionCount,
  currentMonth,
}) => {
  const isPositive = netBalance >= 0;
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const formattedBalance = Math.abs(netBalance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const totalVolume = totalCredited + totalDebited;
  const inflowPercent = totalVolume > 0 ? Math.min(100, Math.round((totalCredited / totalVolume) * 100)) : 0;
  const burnPercent = totalVolume > 0 ? Math.min(100, Math.round((totalDebited / totalVolume) * 100)) : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 4, y: y * -4 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative w-full transition-transform duration-300 ease-out select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
      }}
    >
      {/* Soft minimal ambient glow (No green) */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D4AF37]/10 to-zinc-900/10 blur-lg opacity-40 pointer-events-none" />

      {/* Haute Horlogerie Grand Bezel Chamber */}
      <div className="relative w-full rounded-2xl liquid-glass-card p-4 shadow-[0_12px_30px_rgba(0,0,0,0.85)] overflow-hidden">
        {/* Anti-Reflective Sapphire Crystal Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

        {/* Dial Header */}
        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60" />
            <span className="font-sans text-[10px] tracking-wider text-zinc-400 uppercase font-semibold">
              {currentMonth ? `${currentMonth.toUpperCase()} LEDGER` : 'BALANCE'}
            </span>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-white/[0.1] text-[9px] font-mono tracking-wider uppercase font-semibold bg-white/[0.03] text-zinc-300"
          >
            {transactionCount === 0 ? (
              <span>NO DATA</span>
            ) : isPositive ? (
              <span className="text-[#D4AF37]">SURPLUS</span>
            ) : (
              <span className="text-rose-400/90">DEFICIT</span>
            )}
          </div>
        </div>

        {/* Balance Display (Reduced size for clean aesthetic) */}
        <div className="relative z-10 my-2 text-center">
          <p className="text-[8px] uppercase font-mono tracking-[0.2em] text-zinc-500">
            NET TREASURY BALANCE
          </p>

          <div className="mt-0.5 flex items-baseline justify-center gap-0.5">
            <span className="font-sans text-lg font-normal text-zinc-400">
              {netBalance >= 0 ? '+' : '-'}
              {currency}
            </span>
            <span className="font-sans text-xl sm:text-2xl font-bold tracking-tight text-[#E5C378]">
              {formattedBalance}
            </span>
          </div>
        </div>

        {/* Twin Horological Complications (No green, highly minimal) */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-white/[0.08]">
          {/* Sub-Dial 1: Inflow */}
          <div className="liquid-glass-pill rounded-xl p-2.5 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-[8px] font-mono uppercase text-zinc-400">
              <span>Inflow Ratio</span>
              <span className="text-zinc-200">{inflowPercent}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                <TrendingUp className="w-3 h-3 text-[#E5C378]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[8px] text-zinc-500 uppercase font-mono leading-none">Credited</span>
                <span className="text-xs font-sans font-bold text-zinc-300 truncate block mt-0.5">
                  +{currency}{Math.round(totalCredited).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden border border-white/[0.08]">
              <div
                className="h-full bg-zinc-300 rounded-full transition-all duration-500"
                style={{ width: `${inflowPercent}%` }}
              />
            </div>
          </div>

          {/* Sub-Dial 2: Outflow */}
          <div className="liquid-glass-pill rounded-xl p-2.5 flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between text-[8px] font-mono uppercase text-zinc-400">
              <span>Outflow Ratio</span>
              <span className="text-zinc-200">{burnPercent}%</span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded bg-white/[0.06] border border-white/[0.1] flex items-center justify-center shrink-0">
                <TrendingDown className="w-3 h-3 text-rose-400/80" />
              </div>
              <div className="min-w-0">
                <span className="block text-[8px] text-zinc-500 uppercase font-mono leading-none">Debited</span>
                <span className="text-xs font-sans font-bold text-zinc-300 truncate block mt-0.5">
                  -{currency}{Math.round(totalDebited).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="w-full bg-black/40 rounded-full h-1 overflow-hidden border border-white/[0.08]">
              <div
                className="h-full bg-rose-400/60 rounded-full transition-all duration-500"
                style={{ width: `${burnPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
