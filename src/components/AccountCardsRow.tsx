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
    <div className="grid grid-cols-2 gap-3 w-full">
      {/* 1. Total Debited Card */}
      <div className="rounded-xl p-3.5 bg-[#030a05] border border-zinc-800/90 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-400">
              Total Debited
            </span>
            <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-lg sm:text-xl font-bold text-rose-400 tracking-tight">
            -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Progress ratio indicator */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Share</span>
            <span className="text-rose-400 font-medium">{debitRatio}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${debitRatio}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Total Credited Card */}
      <div className="rounded-xl p-3.5 bg-[#030a05] border border-zinc-800/90 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-zinc-400">
              Total Credited
            </span>
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="text-lg sm:text-xl font-bold text-emerald-400 tracking-tight">
            +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Progress ratio indicator */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
            <span>Share</span>
            <span className="text-emerald-400 font-medium">{creditRatio}%</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${creditRatio}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
