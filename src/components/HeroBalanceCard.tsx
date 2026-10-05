import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Compass } from 'lucide-react';

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
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const formattedBalance = Math.abs(netBalance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Calculate Inflow vs Outflow Complication Dial percentage
  const totalVolume = totalCredited + totalDebited;
  const inflowPercent = totalVolume > 0 ? Math.min(100, Math.round((totalCredited / totalVolume) * 100)) : 50;
  const burnPercent = totalVolume > 0 ? Math.min(100, Math.round((totalDebited / totalVolume) * 100)) : 50;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 6, y: y * -6 });
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
      {/* 18k Champagne Gold Outer Ambient Halo */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-[#D4AF37]/20 via-[#34D399]/10 to-[#F59E0B]/20 blur-xl opacity-70 pointer-events-none" />

      {/* Haute Horlogerie Grand Bezel Chamber */}
      <div className="relative w-full rounded-2xl horology-bezel p-5 shadow-[0_18px_50px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Anti-Reflective Sapphire Crystal Diagonal Sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

        {/* Engine-Turned Guilloché Rings Background */}
        <div className="absolute inset-0 guilloche-rings opacity-40 pointer-events-none" />

        {/* Dial Header: Calibre Specification & Jewel Count */}
        <div className="relative z-10 flex items-center justify-between pb-2 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-1.5">
            <span className="ruby-bearing" />
            <span className="font-serif text-[11px] tracking-widest text-[#E5C378] uppercase font-semibold">
              CALIBRE IC-902 · 28 JEWELS
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-serif tracking-wider uppercase font-semibold backdrop-blur-md ${
              isPositive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
            }`}
          >
            {isPositive ? (
              <>
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span>SOLVENT · SURPLUS</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-3 h-3 text-rose-400" />
                <span>DEFICIT RUN</span>
              </>
            )}
          </div>
        </div>

        {/* Grand Balance Chronometer Dial */}
        <div className="relative z-10 my-4 text-center">
          <p className="text-[10px] uppercase font-serif tracking-[0.25em] text-[#D4AF37]/80">
            NET TREASURY BALANCE
          </p>

          <div className="mt-1 flex items-baseline justify-center gap-1">
            <span className="font-serif text-2xl sm:text-3xl font-normal text-[#E5C378]">
              {isPositive ? '+' : '-'}
              {currency}
            </span>
            <span className="font-serif text-4xl sm:text-5xl font-bold tracking-tight gold-leaf-text drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)]">
              {formattedBalance}
            </span>
          </div>

          <div className="mt-1.5 flex items-center justify-center gap-2 text-[10px] font-mono text-zinc-400">
            <span>{transactionCount} LEDGER ENTRIES</span>
            <span className="text-[#D4AF37]/60">·</span>
            <span className="text-[#F5D478] font-serif tracking-wider uppercase">PERPÉTUEL</span>
          </div>
        </div>

        {/* Twin Horological Complications (Inflow & Outflow Sub-Dials) */}
        <div className="relative z-10 grid grid-cols-2 gap-3 pt-3 border-t border-[#D4AF37]/15">
          {/* Sub-Dial 1: Inflow Complication */}
          <div className="horology-subdial rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-serif uppercase tracking-widest text-[#E5C378]">
              <span>Inflow Ratio</span>
              <span className="font-mono text-emerald-400">{inflowPercent}%</span>
            </div>

            {/* Circular Gauge Miniature */}
            <div className="my-1.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-emerald-500/30 bg-emerald-950/40 flex items-center justify-center shrink-0 shadow-inner">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-zinc-400 uppercase font-mono leading-none">Credited</span>
                <span className="text-xs sm:text-sm font-serif font-bold text-emerald-400 truncate block mt-0.5">
                  +{currency}{totalCredited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Micro Gold Track */}
            <div className="w-full bg-black/60 rounded-full h-1 overflow-hidden border border-emerald-500/20">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${inflowPercent}%` }}
              />
            </div>
          </div>

          {/* Sub-Dial 2: Burn Complication */}
          <div className="horology-subdial rounded-xl p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[9px] font-serif uppercase tracking-widest text-[#E5C378]">
              <span>Burn Velocity</span>
              <span className="font-mono text-rose-400">{burnPercent}%</span>
            </div>

            {/* Circular Gauge Miniature */}
            <div className="my-1.5 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-rose-500/30 bg-rose-950/40 flex items-center justify-center shrink-0 shadow-inner">
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-zinc-400 uppercase font-mono leading-none">Debited</span>
                <span className="text-xs sm:text-sm font-serif font-bold text-rose-400 truncate block mt-0.5">
                  -{currency}{totalDebited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Micro Gold Track */}
            <div className="w-full bg-black/60 rounded-full h-1 overflow-hidden border border-rose-500/20">
              <div
                className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500"
                style={{ width: `${burnPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Hallmark Engraving at Bottom Bezel */}
        <div className="relative z-10 mt-3 pt-2 border-t border-[#D4AF37]/10 flex items-center justify-between text-[9px] text-[#D4AF37]/60 font-serif tracking-[0.2em] uppercase">
          <span>MANUFACTURE D'HORLOGERIE</span>
          <span>POINÇON DE GENÈVE</span>
        </div>
      </div>
    </div>
  );
};
