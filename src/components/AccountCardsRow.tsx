import React from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface AccountCardsRowProps {
  totalDebited: number;
  totalCredited: number;
  currency: string;
}

export const AccountCardsRow: React.FC<AccountCardsRowProps> = ({
  totalDebited,
  totalCredited,
  currency,
}) => {
  const totalFlow = totalDebited + totalCredited || 1;
  const debitRatio = Math.min(100, Math.round((totalDebited / totalFlow) * 100));
  const creditRatio = Math.min(100, Math.round((totalCredited / totalFlow) * 100));

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
      {/* 1. Total Debited Liquid Glass Card */}
      <div className="relative rounded-2xl liquid-glass-card p-3.5 shadow-md flex flex-col justify-between overflow-hidden border border-white/[0.08] hover:border-rose-500/30 transition-colors duration-300">
        {/* Subtle Ambient Red-Violet Chromatic Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-purple-500/5 blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 font-mono tracking-wide uppercase">
              Total Debited
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.15)]">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-lg sm:text-xl font-extrabold text-rose-400 font-mono tracking-tight">
            -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Progress ratio indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
            <span>Share of outflow</span>
            <span className="text-rose-400 font-semibold">{debitRatio}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/50 border border-white/[0.06] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              style={{ width: `${debitRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Total Credited Liquid Glass Card */}
      <div className="relative rounded-2xl liquid-glass-card p-3.5 shadow-md flex flex-col justify-between overflow-hidden border border-white/[0.08] hover:border-emerald-500/30 transition-colors duration-300">
        {/* Subtle Ambient Emerald-Cyan Chromatic Accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 font-mono tracking-wide uppercase">
              Total Credited
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-lg sm:text-xl font-extrabold text-emerald-400 font-mono tracking-tight">
            +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Progress ratio indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
            <span>Share of inflow</span>
            <span className="text-emerald-400 font-semibold">{creditRatio}%</span>
          </div>
          <div className="w-full h-1.5 bg-black/50 border border-white/[0.06] rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              style={{ width: `${creditRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
