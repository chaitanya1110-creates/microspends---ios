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
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {/* 1. Debited Outflow */}
      <div className="relative rounded-xl liquid-glass-card p-3 flex flex-col justify-between overflow-hidden shadow-lg hover:border-white/[0.2] transition duration-300">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              Total Debited
            </span>
            <div className="w-5 h-5 rounded bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-rose-400/90">
              <ArrowDownRight className="w-3 h-3" />
            </div>
          </div>

          <div className="text-sm font-serif font-bold text-zinc-100 tracking-tight">
            -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Progress ratio */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 mb-0.5">
            <span>Outflow Share</span>
            <span className="text-rose-400/90">{debitRatio}%</span>
          </div>
          <div className="w-full h-0.5 bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400/60 rounded-full transition-all duration-300"
              style={{ width: `${debitRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Credited Reserves */}
      <div className="relative rounded-xl liquid-glass-card p-3 flex flex-col justify-between overflow-hidden shadow-lg hover:border-white/[0.2] transition duration-300">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
              Total Credited
            </span>
            <div className="w-5 h-5 rounded bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#E5C378]">
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>

          <div className="text-sm font-serif font-bold text-zinc-100 tracking-tight">
            +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Progress ratio */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 mb-0.5">
            <span>Inflow Share</span>
            <span className="text-zinc-300">{creditRatio}%</span>
          </div>
          <div className="w-full h-0.5 bg-black/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-300 rounded-full transition-all duration-300"
              style={{ width: `${creditRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
