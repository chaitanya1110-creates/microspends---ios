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
  const debitRatio = totalDebited + totalCredited > 0 ? Math.min(100, Math.round((totalDebited / totalFlow) * 100)) : 0;
  const creditRatio = totalDebited + totalCredited > 0 ? Math.min(100, Math.round((totalCredited / totalFlow) * 100)) : 0;

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
      {/* 1. Debited Outflow Chamber */}
      <div className="relative rounded-2xl horology-subdial p-3.5 shadow-lg flex flex-col justify-between overflow-hidden border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-colors duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-rose-500/10 to-transparent blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#E5C378] font-semibold">
              Total Debited
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-950/70 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-base sm:text-lg font-serif font-bold text-rose-400 tracking-tight">
            -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Progress ratio indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1">
            <span>Outflow Share</span>
            <span className="text-rose-400 font-semibold">{debitRatio}%</span>
          </div>
          <div className="w-full h-1 bg-black/80 border border-[#D4AF37]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-700 via-rose-500 to-[#D4AF37] rounded-full transition-all duration-300"
              style={{ width: `${debitRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Credited Reserves Chamber */}
      <div className="relative rounded-2xl horology-subdial p-3.5 shadow-lg flex flex-col justify-between overflow-hidden border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 transition-colors duration-300">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#E5C378] font-semibold">
              Total Credited
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-base sm:text-lg font-serif font-bold text-emerald-400 tracking-tight">
            +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Progress ratio indicator */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1">
            <span>Inflow Share</span>
            <span className="text-emerald-400 font-semibold">{creditRatio}%</span>
          </div>
          <div className="w-full h-1 bg-black/80 border border-[#D4AF37]/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-[#D4AF37] rounded-full transition-all duration-300"
              style={{ width: `${creditRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
