import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Zap, 
  ArrowDownRight, 
  ArrowUpRight, 
  Shield, 
  Plus, 
  RotateCcw,
  Volume2,
  VolumeX,
  Smartphone,
  ChevronRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Transaction, Subscription, GamificationProfile } from '../types';
import { WatchActivityRings } from './WatchActivityRings';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface WatchFaceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  subscriptions: Subscription[];
  gamification: GamificationProfile;
  totalDebited: number;
  totalCredited: number;
  netBalance: number;
  currency: string;
  currentMonth: string;
  onQuickAdd: () => void;
  soundEnabled: boolean;
}

export const WatchFaceModeModal: React.FC<WatchFaceModeModalProps> = ({
  isOpen,
  onClose,
  transactions,
  subscriptions,
  gamification,
  totalDebited,
  totalCredited,
  netBalance,
  currency,
  currentMonth,
  onQuickAdd,
  soundEnabled,
}) => {
  const [time, setTime] = useState(new Date());
  const [activeStackIndex, setActiveStackIndex] = useState(0);

  // Live ticking clock with seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dayName = time.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = time.getDate();

  const activeSubsCost = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + s.amount, 0);

  // Recent 3 transactions
  const recentTxs = transactions.slice(0, 3);

  // Digital Crown rotation simulation
  const handleRotateCrown = (direction: 'up' | 'down') => {
    if (soundEnabled) soundFx.tap();
    triggerHaptic('light');
    setActiveStackIndex((prev) => {
      if (direction === 'up') return Math.max(0, prev - 1);
      return Math.min(2, prev + 1);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 animate-in fade-in duration-200">
      {/* Container with Close Bar */}
      <div className="relative w-full max-w-sm flex flex-col items-center">
        {/* Top Control Bar */}
        <div className="w-full flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider text-orange-400 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#ff5a00]" />
              Apple Watch Ultra Mode
            </span>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-zinc-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Watch Chassis Container */}
        <div className="relative flex items-center justify-center">
          {/* Left: International Orange Action Button (Tactile Hardware simulation) */}
          <div className="absolute -left-3 top-28 z-30 flex flex-col items-center">
            <button
              onClick={() => {
                if (soundEnabled) soundFx.goldChime();
                triggerHaptic('success');
                onClose();
                onQuickAdd();
              }}
              title="International Orange Action Button - Instant Quick Log"
              className="w-3.5 h-16 rounded-l-md bg-gradient-to-r from-orange-600 to-[#FF5A00] shadow-[0_0_12px_rgba(255,90,0,0.7)] hover:brightness-110 active:translate-x-0.5 transition-all cursor-pointer border-y border-l border-orange-400/80 flex items-center justify-center group"
            >
              <span className="sr-only">Action Button</span>
            </button>
            <span className="text-[8px] font-mono font-bold text-orange-400/80 -rotate-90 mt-4 tracking-tighter whitespace-nowrap">
              ACTION
            </span>
          </div>

          {/* Right: Digital Crown & Side Button (Tactile Hardware simulation) */}
          <div className="absolute -right-3.5 top-16 z-30 flex flex-col items-center gap-6">
            {/* Digital Crown */}
            <div className="flex flex-col items-center">
              <div 
                className="w-4 h-14 rounded-r-md bg-gradient-to-l from-zinc-500 via-zinc-400 to-zinc-600 border-y border-r border-zinc-400/80 shadow-md flex flex-col justify-around py-1 cursor-ns-resize group active:scale-95 transition-transform"
                onClick={() => handleRotateCrown('down')}
                title="Digital Crown - Click or Scroll"
              >
                {/* Crown ridges */}
                <span className="w-full h-[1px] bg-zinc-700 block" />
                <span className="w-full h-[1px] bg-zinc-700 block" />
                <span className="w-full h-[1px] bg-zinc-700 block" />
                <span className="w-full h-[1px] bg-orange-500 block h-[2px] shadow-[0_0_4px_#ff5a00]" />
                <span className="w-full h-[1px] bg-zinc-700 block" />
                <span className="w-full h-[1px] bg-zinc-700 block" />
              </div>
              <span className="text-[8px] font-mono text-zinc-400/80 rotate-90 mt-3 tracking-tighter whitespace-nowrap">
                CROWN
              </span>
            </div>

            {/* Side Button */}
            <button
              onClick={() => handleRotateCrown('up')}
              className="w-2.5 h-10 rounded-r-sm bg-zinc-600 hover:bg-zinc-500 border border-zinc-400/60 shadow-sm active:translate-x-[-1px] transition-transform"
              title="Side Button"
            />
          </div>

          {/* Titanium Outer Casing (Rounded Squircle) */}
          <div className="relative w-[310px] sm:w-[330px] rounded-[48px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-2 sm:p-2.5 shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.4)] border border-zinc-600/70">
            {/* Raised Screen Lip (Ultra Sapphire Bezel) */}
            <div className="w-full rounded-[40px] bg-black p-3.5 sm:p-4 border-2 border-zinc-800/90 shadow-[inset_0_0_15px_rgba(0,0,0,1)] overflow-hidden flex flex-col justify-between aspect-[4/5] min-h-[410px]">
              
              {/* watchOS OLED Screen Content */}
              <div className="relative w-full h-full flex flex-col justify-between select-none">
                
                {/* 1. Top Complications Row */}
                <div className="flex items-center justify-between">
                  {/* Left Complication: Date & Month */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold tracking-wider text-orange-400 font-mono leading-none">
                      {dayName} {dayNum}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono tracking-tight mt-0.5">
                      {currentMonth}
                    </span>
                  </div>

                  {/* Center / Right: Live Digital Clock */}
                  <div className="flex items-baseline font-mono">
                    <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                      {hours}:{minutes}
                    </span>
                    <span className="text-xs font-bold text-orange-400 ml-1">
                      :{seconds}
                    </span>
                  </div>
                </div>

                {/* 2. Middle Watch Face Center: Concentric Activity Rings & Net Worth */}
                <div className="my-auto py-2 flex flex-col items-center">
                  <WatchActivityRings
                    dailySpend={totalDebited}
                    dailyGoal={2000}
                    monthlySpend={totalDebited}
                    monthlyGoal={50000}
                    streakDays={gamification.streakDays}
                    streakGoal={14}
                    currency={currency}
                    soundEnabled={soundEnabled}
                  />

                  {/* Glanceable Net Metric under rings */}
                  <div className="mt-2 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
                        Net Balance
                      </span>
                      <span className={`text-xs font-mono font-black ${
                        netBalance >= 0 ? 'text-[#30D158]' : 'text-[#FF2D55]'
                      }`}>
                        {netBalance >= 0 ? '+' : '-'}{currency}{Math.abs(netBalance).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Complications Row / Smart Stack Pager */}
                <div className="pt-2 border-t border-white/[0.08]">
                  {activeStackIndex === 0 && (
                    <div className="flex items-center justify-between text-xs animate-in fade-in duration-150">
                      {/* Outflow Pill Complication */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#FF2D55]/20 flex items-center justify-center text-[#FF2D55]">
                          <ArrowDownRight className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono uppercase text-zinc-400">Outflow</span>
                          <span className="text-[11px] font-bold font-mono text-[#FF2D55] leading-none">
                            -{currency}{totalDebited.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* Inflow Pill Complication */}
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-[#30D158]/20 flex items-center justify-center text-[#30D158]">
                          <ArrowUpRight className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[8px] font-mono uppercase text-zinc-400">Inflow</span>
                          <span className="text-[11px] font-bold font-mono text-[#30D158] leading-none">
                            +{currency}{totalCredited.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStackIndex === 1 && (
                    <div className="space-y-1 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400">
                        <span className="uppercase text-orange-400 font-bold">Latest Entry</span>
                        <span>{recentTxs[0]?.date || 'Today'}</span>
                      </div>
                      {recentTxs[0] ? (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-200 truncate max-w-[150px] font-medium">
                            {recentTxs[0].title}
                          </span>
                          <span className={`font-mono font-bold ${
                            recentTxs[0].type === 'credit' ? 'text-[#30D158]' : 'text-[#FF2D55]'
                          }`}>
                            {recentTxs[0].type === 'credit' ? '+' : '-'}{currency}{recentTxs[0].amount.toFixed(0)}
                          </span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-zinc-500">No transactions recorded</div>
                      )}
                    </div>
                  )}

                  {activeStackIndex === 2 && (
                    <div className="flex items-center justify-between text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#BF5AF2]/20 flex items-center justify-center text-[#BF5AF2]">
                          <Zap className="w-3 h-3" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] font-mono uppercase text-zinc-400">Status</span>
                          <span className="text-[11px] font-bold font-mono text-[#BF5AF2] leading-none">
                            Lvl {gamification.level} {gamification.levelTitle.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold">
                        {gamification.xp} XP
                      </span>
                    </div>
                  )}

                  {/* Pagination Dots (watchOS Smart Stack indicator) */}
                  <div className="flex items-center justify-center gap-1.5 mt-2">
                    {[0, 1, 2].map((idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          if (soundEnabled) soundFx.tap();
                          setActiveStackIndex(idx);
                        }}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          activeStackIndex === idx
                            ? 'bg-orange-500 w-3 shadow-[0_0_6px_#ff5a00]'
                            : 'bg-zinc-700 hover:bg-zinc-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Quick Tips below Watch */}
        <div className="mt-4 flex items-center gap-3 text-center text-xs text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            Action button = Quick Add
          </span>
          <span>·</span>
          <span>Digital Crown = Scroll Widgets</span>
        </div>
      </div>
    </div>
  );
};
