import React, { useState, useRef } from 'react';
import { Flame, Target, Zap, RotateCcw } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface WatchActivityRingsProps {
  dailySpend: number;
  dailyGoal: number;
  monthlySpend: number;
  monthlyGoal: number;
  streakDays: number;
  streakGoal?: number;
  currency: string;
  soundEnabled: boolean;
  onAdjustDailyGoal?: (newGoal: number) => void;
}

export const WatchActivityRings: React.FC<WatchActivityRingsProps> = ({
  dailySpend,
  dailyGoal,
  monthlySpend,
  monthlyGoal,
  streakDays,
  streakGoal = 14,
  currency,
  soundEnabled,
  onAdjustDailyGoal,
}) => {
  const [activeRing, setActiveRing] = useState<'move' | 'exercise' | 'stand' | 'all'>('all');
  const [isRotatingCrown, setIsRotatingCrown] = useState(false);
  const [crownRotation, setCrownRotation] = useState(0);
  const crownDragStartY = useRef<number | null>(null);

  // Percentages (clamped 0 to 1.5 for overachieving)
  const movePct = Math.min(dailySpend / (dailyGoal || 1), 1.5);
  const exercisePct = Math.min(monthlySpend / (monthlyGoal || 1), 1.5);
  const standPct = Math.min(streakDays / (streakGoal || 1), 1.5);

  // SVG Geometry
  const size = 180;
  const strokeWidth = 14;
  const center = size / 2;

  // Ring radii
  const rMove = 74;      // Red / Coral - Daily Burn
  const rExercise = 56;  // Chartreuse Green - Budget Pace
  const rStand = 38;     // Electric Cyan - Streak / Discipline

  const getCircumference = (r: number) => 2 * Math.PI * r;
  const cMove = getCircumference(rMove);
  const cExercise = getCircumference(rExercise);
  const cStand = getCircumference(rStand);

  // Offsets
  const offsetMove = cMove * (1 - Math.min(movePct, 1));
  const offsetExercise = cExercise * (1 - Math.min(exercisePct, 1));
  const offsetStand = cStand * (1 - Math.min(standPct, 1));

  // Digital Crown Drag Interaction
  const handleCrownMouseDown = (e: React.MouseEvent) => {
    crownDragStartY.current = e.clientY;
    setIsRotatingCrown(true);
  };

  const handleCrownTouchStart = (e: React.TouchEvent) => {
    crownDragStartY.current = e.touches[0].clientY;
    setIsRotatingCrown(true);
  };

  const handleCrownDrag = (clientY: number) => {
    if (crownDragStartY.current === null) return;
    const delta = crownDragStartY.current - clientY;
    if (Math.abs(delta) > 8) {
      const step = delta > 0 ? 100 : -100;
      const nextGoal = Math.max(500, Math.min(10000, dailyGoal + step));
      if (onAdjustDailyGoal && nextGoal !== dailyGoal) {
        onAdjustDailyGoal(nextGoal);
      }
      setCrownRotation((prev) => prev + (delta > 0 ? 18 : -18));
      crownDragStartY.current = clientY;
      if (soundEnabled) soundFx.crownTick();
      triggerHaptic('light');
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-black border border-white/[0.08] p-4 text-white overflow-hidden shadow-2xl">
      {/* Specular curved glass rim like watchOS sapphire crystal */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent pointer-events-none rounded-t-3xl" />

      {/* Header: Title & Active Ring Filter */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#FF2D55] animate-pulse" />
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-zinc-300">
            Activity Rings
          </span>
          <span className="text-[10px] font-mono text-zinc-500">watchOS</span>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => {
              setActiveRing('all');
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
            }}
            className={`px-2 py-0.5 rounded-lg text-[10px] font-mono transition ${
              activeRing === 'all' ? 'bg-white/20 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setActiveRing('move');
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
            }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono transition ${
              activeRing === 'move' ? 'bg-[#FF2D55]/30 text-[#FF2D55] font-bold' : 'text-zinc-500 hover:text-rose-400'
            }`}
          >
            Burn
          </button>
          <button
            onClick={() => {
              setActiveRing('exercise');
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
            }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono transition ${
              activeRing === 'exercise' ? 'bg-[#00E676]/30 text-[#00E676] font-bold' : 'text-zinc-500 hover:text-emerald-400'
            }`}
          >
            Pace
          </button>
          <button
            onClick={() => {
              setActiveRing('stand');
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
            }}
            className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono transition ${
              activeRing === 'stand' ? 'bg-[#00F0FF]/30 text-[#00F0FF] font-bold' : 'text-zinc-500 hover:text-cyan-400'
            }`}
          >
            Streak
          </button>
        </div>
      </div>

      {/* Main Rings Display + Digital Crown Scrub Hub */}
      <div className="relative flex items-center justify-between gap-4 py-1">
        
        {/* SVG Activity Rings */}
        <div className="relative w-[180px] h-[180px] shrink-0 mx-auto sm:mx-0">
          <svg className="w-full h-full -rotate-90 filter drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]">
            <defs>
              {/* Glow Filters */}
              <filter id="ring-glow-move" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="ring-glow-exercise" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="ring-glow-stand" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Linear Gradients for Authentic Apple Watch look */}
              <linearGradient id="grad-move" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF1744" />
                <stop offset="100%" stopColor="#FF5252" />
              </linearGradient>

              <linearGradient id="grad-exercise" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E676" />
                <stop offset="100%" stopColor="#76FF03" />
              </linearGradient>

              <linearGradient id="grad-stand" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00E5FF" />
                <stop offset="100%" stopColor="#00B0FF" />
              </linearGradient>
            </defs>

            {/* Background Tracks */}
            <circle
              cx={center}
              cy={center}
              r={rMove}
              fill="transparent"
              stroke="#FF1744"
              strokeWidth={strokeWidth}
              opacity={0.16}
            />
            <circle
              cx={center}
              cy={center}
              r={rExercise}
              fill="transparent"
              stroke="#00E676"
              strokeWidth={strokeWidth}
              opacity={0.16}
            />
            <circle
              cx={center}
              cy={center}
              r={rStand}
              fill="transparent"
              stroke="#00E5FF"
              strokeWidth={strokeWidth}
              opacity={0.16}
            />

            {/* Active Move / Burn Ring (Red) */}
            <circle
              cx={center}
              cy={center}
              r={rMove}
              fill="transparent"
              stroke="url(#grad-move)"
              strokeWidth={strokeWidth}
              strokeDasharray={cMove}
              strokeDashoffset={offsetMove}
              strokeLinecap="round"
              filter={activeRing === 'move' || activeRing === 'all' ? 'url(#ring-glow-move)' : undefined}
              className="transition-all duration-700 ease-out"
              opacity={activeRing === 'exercise' || activeRing === 'stand' ? 0.3 : 1}
            />

            {/* Active Exercise / Budget Ring (Green) */}
            <circle
              cx={center}
              cy={center}
              r={rExercise}
              fill="transparent"
              stroke="url(#grad-exercise)"
              strokeWidth={strokeWidth}
              strokeDasharray={cExercise}
              strokeDashoffset={offsetExercise}
              strokeLinecap="round"
              filter={activeRing === 'exercise' || activeRing === 'all' ? 'url(#ring-glow-exercise)' : undefined}
              className="transition-all duration-700 ease-out"
              opacity={activeRing === 'move' || activeRing === 'stand' ? 0.3 : 1}
            />

            {/* Active Stand / Streak Ring (Cyan) */}
            <circle
              cx={center}
              cy={center}
              r={rStand}
              fill="transparent"
              stroke="url(#grad-stand)"
              strokeWidth={strokeWidth}
              strokeDasharray={cStand}
              strokeDashoffset={offsetStand}
              strokeLinecap="round"
              filter={activeRing === 'stand' || activeRing === 'all' ? 'url(#ring-glow-stand)' : undefined}
              className="transition-all duration-700 ease-out"
              opacity={activeRing === 'move' || activeRing === 'exercise' ? 0.3 : 1}
            />
          </svg>

          {/* Center Activity Ring Icon Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {activeRing === 'move' && (
              <Flame className="w-5 h-5 text-[#FF2D55] animate-bounce" />
            )}
            {activeRing === 'exercise' && (
              <Target className="w-5 h-5 text-[#00E676] animate-pulse" />
            )}
            {activeRing === 'stand' && (
              <Zap className="w-5 h-5 text-[#00F0FF] animate-pulse" />
            )}
            {activeRing === 'all' && (
              <div className="text-center font-mono">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block leading-tight">Close</span>
                <span className="text-sm font-bold text-white tracking-tighter">RINGS</span>
              </div>
            )}
          </div>
        </div>

        {/* Ring Metrics Breakdown List */}
        <div className="flex-1 space-y-2.5 min-w-0">
          
          {/* Ring 1: Burn (Move) */}
          <div 
            onClick={() => setActiveRing(activeRing === 'move' ? 'all' : 'move')}
            className={`cursor-pointer p-2 rounded-xl transition ${
              activeRing === 'move' ? 'bg-[#FF2D55]/15 border border-[#FF2D55]/30' : 'hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#FF5252] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#FF1744] shadow-[0_0_6px_#FF1744]" />
                BURN
              </span>
              <span className="text-zinc-200 font-bold">
                {Math.round(movePct * 100)}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono text-[11px]">
              <span className="text-white font-bold">
                {currency}{Math.round(dailySpend).toLocaleString()}
              </span>
              <span className="text-zinc-500">/ {currency}{dailyGoal.toLocaleString()}</span>
            </div>
          </div>

          {/* Ring 2: Pace (Exercise) */}
          <div 
            onClick={() => setActiveRing(activeRing === 'exercise' ? 'all' : 'exercise')}
            className={`cursor-pointer p-2 rounded-xl transition ${
              activeRing === 'exercise' ? 'bg-[#00E676]/15 border border-[#00E676]/30' : 'hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#76FF03] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00E676] shadow-[0_0_6px_#00E676]" />
                PACE
              </span>
              <span className="text-zinc-200 font-bold">
                {Math.round(exercisePct * 100)}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono text-[11px]">
              <span className="text-white font-bold">
                {currency}{Math.round(monthlySpend).toLocaleString()}
              </span>
              <span className="text-zinc-500">/ {currency}{monthlyGoal.toLocaleString()}</span>
            </div>
          </div>

          {/* Ring 3: Streak (Stand) */}
          <div 
            onClick={() => setActiveRing(activeRing === 'stand' ? 'all' : 'stand')}
            className={`cursor-pointer p-2 rounded-xl transition ${
              activeRing === 'stand' ? 'bg-[#00E5FF]/15 border border-[#00E5FF]/30' : 'hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#00E5FF] font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                STREAK
              </span>
              <span className="text-zinc-200 font-bold">
                {Math.round(standPct * 100)}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mt-0.5 font-mono text-[11px]">
              <span className="text-white font-bold">{streakDays} Days</span>
              <span className="text-zinc-500">/ {streakGoal}d target</span>
            </div>
          </div>

        </div>

        {/* Tactile Digital Crown Dial on Right Flank */}
        <div className="hidden sm:flex flex-col items-center justify-center pl-1 shrink-0">
          <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-1.5">
            CROWN
          </span>
          <div
            onMouseDown={handleCrownMouseDown}
            onMouseMove={(e) => isRotatingCrown && handleCrownDrag(e.clientY)}
            onMouseUp={() => setIsRotatingCrown(false)}
            onMouseLeave={() => setIsRotatingCrown(false)}
            onTouchStart={handleCrownTouchStart}
            onTouchMove={(e) => handleCrownDrag(e.touches[0].clientY)}
            onTouchEnd={() => setIsRotatingCrown(false)}
            title="Drag up or down to adjust daily burn ceiling"
            className="w-5 h-16 rounded-md bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-800 border border-zinc-600 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_8px_rgba(0,0,0,0.8)] cursor-ns-resize relative overflow-hidden flex flex-col items-center justify-around py-1 group select-none active:scale-95 transition-transform"
          >
            {/* Orange Ultra accent ring */}
            <div className="absolute inset-x-0 h-1 bg-amber-500 top-1.5 opacity-90 shadow-[0_0_4px_#f59e0b]" />

            {/* Fluted ratchet ridges with dynamic rotation angle */}
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="w-3.5 h-[1.5px] bg-zinc-950/70 rounded-full transition-transform"
                style={{
                  transform: `translateY(${(Math.sin((crownRotation + idx * 30) * (Math.PI / 180)) * 2).toFixed(1)}px)`,
                }}
              />
            ))}
          </div>
          <span className="text-[8px] font-mono text-amber-400/80 mt-1">±Goal</span>
        </div>

      </div>

      {/* Quick Complication Actions */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
        <span className="text-[10px] text-zinc-500">Daily Cap: {currency}{dailyGoal}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (onAdjustDailyGoal) onAdjustDailyGoal(dailyGoal - 200);
              if (soundEnabled) soundFx.crownTick();
              triggerHaptic('light');
            }}
            className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition active:scale-90"
          >
            -200
          </button>
          <button
            onClick={() => {
              if (onAdjustDailyGoal) onAdjustDailyGoal(dailyGoal + 200);
              if (soundEnabled) soundFx.crownTick();
              triggerHaptic('light');
            }}
            className="px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 transition active:scale-90"
          >
            +200
          </button>
        </div>
      </div>
    </div>
  );
};
