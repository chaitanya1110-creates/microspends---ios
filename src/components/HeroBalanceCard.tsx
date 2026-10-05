import React from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

interface HeroBalanceCardProps {
  totalCredited: number;
  totalDebited: number;
  netBalance: number;
  currency: string;
  transactionCount: number;
}

export const HeroBalanceCard: React.FC<HeroBalanceCardProps> = ({
  totalCredited,
  totalDebited,
  netBalance,
  currency,
  transactionCount,
}) => {
  const isPositive = netBalance >= 0;

  const formattedBalance = Math.abs(netBalance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="relative w-full group">
      {/* Delicate Minimal RGB Aurora Ambient Glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 via-purple-500/15 to-amber-500/20 blur-xl opacity-60 pointer-events-none transition-opacity duration-500 group-hover:opacity-85" />

      {/* Liquid Glass Main Card */}
      <div className="relative w-full rounded-2xl liquid-glass-card rgb-border-subtle p-5 shadow-[0_12px_40px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Top-Lit Specular Liquid Reflection */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />

        {/* Top Row: Label & Status Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase font-mono">
              Net Balance
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse shadow-[0_0_8px_#10b981]" />
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium backdrop-blur-md border ${
              isPositive
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
            }`}
          >
            {isPositive ? (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold tracking-wide">In Green</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-semibold tracking-wide">Deficit</span>
              </>
            )}
          </div>
        </div>

        {/* Main Balance Display */}
        <div className="my-3">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-zinc-400 font-mono">
              {isPositive ? '+' : '-'}
              {currency}
            </span>
            <span
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-sans drop-shadow-sm ${
                isPositive ? 'text-zinc-50' : 'text-rose-400'
              }`}
            >
              {formattedBalance}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[11px] font-mono text-zinc-400">
              {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'} this cycle
            </p>
            <span className="text-zinc-600">•</span>
            <span className="text-[10px] font-mono text-amber-300/80 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Obsidian Vault
            </span>
          </div>
        </div>

        {/* Inflow & Outflow Summary (Liquid Glass Sub-Panel) */}
        <div className="mt-3 pt-3 border-t border-white/[0.07] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="text-zinc-400">In:</span>
              <span className="font-bold text-emerald-400">
                +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="h-3 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
            <div className="flex items-center gap-1 font-mono text-[11px]">
              <span className="text-zinc-400">Out:</span>
              <span className="font-bold text-rose-400">
                -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
