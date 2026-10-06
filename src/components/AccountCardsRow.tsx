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
    <div className="grid grid-cols-2 gap-2 w-full">
      {/* 1. Debited Outflow */}
      <div className="relative rounded-xl liquid-glass-card p-3 flex flex-col justify-between overflow-hidden shadow-lg transition duration-300">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">
              Debited
            </span>
            <div className="w-4 h-4 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-rose-400/80">
              <ArrowDownRight className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="text-xs font-bold text-zinc-100 tracking-tight">
            -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Progress ratio */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500 mb-0.5">
            <span>Share</span>
            <span className="text-rose-400/70">{debitRatio}%</span>
          </div>
          <div className="w-full h-0.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400/50 rounded-full transition-all duration-300"
              style={{ width: `${debitRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Credited Reserves */}
      <div className="relative rounded-xl liquid-glass-card p-3 flex flex-col justify-between overflow-hidden shadow-lg transition duration-300">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-500">
              Credited
            </span>
            <div className="w-4 h-4 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#E5C378]">
              <ArrowUpRight className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="text-xs font-bold text-zinc-100 tracking-tight">
            +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* Progress ratio */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[7px] font-mono text-zinc-500 mb-0.5">
            <span>Share</span>
            <span className="text-zinc-400">{creditRatio}%</span>
          </div>
          <div className="w-full h-0.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-400/60 rounded-full transition-all duration-300"
              style={{ width: `${creditRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
