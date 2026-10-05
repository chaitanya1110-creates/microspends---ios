import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className="w-full rounded-2xl bg-gradient-to-b from-[#051108]/90 to-[#020503]/95 border border-zinc-800/90 p-5 shadow-lg">
      {/* Top Row: Label & Status Indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          Total Balance
        </span>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300">
          {isPositive ? (
            <>
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Positive</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-3 h-3 text-rose-400" />
              <span className="text-rose-400 font-medium">Deficit</span>
            </>
          )}
        </div>
      </div>

      {/* Main Balance Display */}
      <div className="my-3">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-zinc-400">
            {isPositive ? '+' : '-'}
            {currency}
          </span>
          <span
            className={`text-3xl sm:text-4xl font-bold tracking-tight ${
              isPositive ? 'text-zinc-50' : 'text-rose-400'
            }`}
          >
            {formattedBalance}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">
          {transactionCount} {transactionCount === 1 ? 'transaction' : 'transactions'} this period
        </p>
      </div>

      {/* Inflow & Outflow Summary (Clean & Minimal) */}
      <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-zinc-400">Inflow:</span>
          <span className="font-semibold text-emerald-400">
            +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span className="text-zinc-400">Outflow:</span>
          <span className="font-semibold text-rose-400">
            -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
