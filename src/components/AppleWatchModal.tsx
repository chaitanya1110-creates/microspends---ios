import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Flame, 
  Sparkles, 
  Shield, 
  Mic, 
  Coffee, 
  Car, 
  ShoppingBag, 
  Utensils, 
  RotateCw, 
  Check, 
  ChevronUp, 
  ChevronDown,
  Activity,
  Layers,
  Zap,
  TrendingUp,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Transaction, Subscription, AdvisorInsight } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface AppleWatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  subscriptions: Subscription[];
  oracleInsight: AdvisorInsight;
  currency: string;
  soundEnabled: boolean;
  onQuickLog: (tx: { title: string; amount: number; type: 'debit' | 'credit'; category: string; merchant: string }) => void;
  dailyGoal?: number;
  streakDays?: number;
}

export const AppleWatchModal: React.FC<AppleWatchModalProps> = ({
  isOpen,
  onClose,
  transactions,
  subscriptions,
  oracleInsight,
  currency,
  soundEnabled,
  onQuickLog,
  dailyGoal = 2000,
  streakDays = 8,
}) => {
  // Watch State
  const [timeStr, setTimeStr] = useState('09:41');
  const [secStr, setSecStr] = useState('28');
  const [activeStackIndex, setActiveStackIndex] = useState<number>(0); // 0: Main Face, 1: Quick Log, 2: Oracle Glance, 3: Vault Glance
  const [crownRotation, setCrownRotation] = useState(0);
  const [justLoggedItem, setJustLoggedItem] = useState<string | null>(null);

  // Digital Crown Drag State
  const isDraggingCrown = useRef(false);
  const crownDragStartY = useRef<number | null>(null);

  // Live Clock Update
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      setSecStr(now.getSeconds().toString().padStart(2, '0'));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate Today's Spend
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayDebitTxs = transactions.filter((t) => t.type === 'debit' && t.date === todayDateStr);
  const todaySpend = todayDebitTxs.reduce((sum, t) => sum + t.amount, 0);

  // Activity Ring Percentages
  const burnPct = Math.min(todaySpend / dailyGoal, 1);
  const budgetPct = 0.68;
  const streakPct = Math.min(streakDays / 14, 1);

  // Turn Digital Crown to scrub Smart Stack
  const handleCrownScrub = (delta: number) => {
    setCrownRotation((prev) => prev + (delta > 0 ? 25 : -25));
    if (soundEnabled) soundFx.crownTick();
    triggerHaptic('light');

    if (delta > 0) {
      setActiveStackIndex((prev) => (prev < 3 ? prev + 1 : 0));
    } else {
      setActiveStackIndex((prev) => (prev > 0 ? prev - 1 : 3));
    }
  };

  const handleCrownMouseDown = (e: React.MouseEvent) => {
    isDraggingCrown.current = true;
    crownDragStartY.current = e.clientY;
  };

  const handleCrownMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingCrown.current || crownDragStartY.current === null) return;
    const diff = crownDragStartY.current - e.clientY;
    if (Math.abs(diff) > 18) {
      handleCrownScrub(diff);
      crownDragStartY.current = e.clientY;
    }
  };

  const handleCrownMouseUp = () => {
    isDraggingCrown.current = false;
  };

  // Quick Log Action
  const triggerQuickLog = (title: string, amount: number, category: string, merchant: string) => {
    onQuickLog({
      title,
      amount,
      type: 'debit',
      category,
      merchant,
    });
    setJustLoggedItem(`${title} (-${currency}${amount})`);
    if (soundEnabled) soundFx.debitChirp();
    triggerHaptic('success');

    setTimeout(() => {
      setJustLoggedItem(null);
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 animate-in fade-in duration-200 select-none">
      
      {/* Outer Container with Close and Title */}
      <div className="relative flex flex-col items-center max-w-sm w-full">
        
        {/* Top Floating Badge Bar */}
        <div className="w-full flex items-center justify-between pb-3 px-2 text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse" />
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Apple Watch Ultra Companion
            </span>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close watch mode"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 49mm Apple Watch Ultra Chassis Simulation               */}
        {/* ======================================================== */}
        <div className="relative flex items-center justify-center">

          {/* Left: Orange International Action Button */}
          <button
            onClick={() => {
              // Action Button quick logs Coffee
              triggerQuickLog('Coffee', 180, 'Food & Dining', 'Starbucks');
            }}
            title="Orange Action Button: 1-Tap Coffee Log"
            className="w-3.5 h-16 rounded-l-md bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_12px_rgba(249,115,22,0.6)] hover:brightness-110 active:scale-95 transition-all -mr-1 z-0 cursor-pointer flex items-center justify-center"
          >
            <div className="w-1 h-8 rounded-full bg-orange-300/40" />
          </button>

          {/* Main Watch Case (Brushed Aerospace Titanium) */}
          <div className="relative w-[280px] h-[340px] rounded-[48px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-900 p-3 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_6px_rgba(0,0,0,0.8)] border border-zinc-500/60 z-10 flex flex-col items-center justify-center">
            
            {/* Raised Screen Ceramic Bezel */}
            <div className="relative w-full h-full rounded-[40px] bg-black border-2 border-zinc-600/40 shadow-inner overflow-hidden flex flex-col p-3.5">
              
              {/* Sapphire Glass Top Specular Glare */}
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/[0.12] via-white/[0.03] to-transparent pointer-events-none rounded-t-[38px]" />

              {/* Status Header: Orange Accent, Time & Battery */}
              <div className="flex items-center justify-between text-[11px] font-mono font-semibold tracking-tight text-zinc-300 relative z-10">
                <div className="flex items-center gap-1">
                  <span className="text-orange-400 font-bold">{timeStr}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">:{secStr}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-zinc-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C378] shadow-[0_0_6px_#D4AF37]" />
                  <span>ICARUS</span>
                </div>
              </div>

              {/* Just Logged Overlay Alert */}
              {justLoggedItem && (
                <div className="absolute inset-x-3 top-8 z-30 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black text-center font-sans font-bold text-[11px] shadow-lg animate-in slide-in-from-top-2 duration-150">
                  Logged: {justLoggedItem}
                </div>
              )}

              {/* ======================================================== */}
              {/* SCREEN CONTENT BASED ON ACTIVE SMART STACK CARD         */}
              {/* ======================================================== */}
              <div className="flex-1 flex flex-col justify-between py-1 relative z-10 mt-1">

                {/* CARD 0: Modular Ultra Face with 4 Complications & Center Rings */}
                {activeStackIndex === 0 && (
                  <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                    
                    {/* Top 2 Corner Complications */}
                    <div className="flex items-center justify-between">
                      {/* Top-Left: Oracle Score Complication */}
                      <button
                        onClick={() => {
                          setActiveStackIndex(2);
                          if (soundEnabled) soundFx.tap();
                        }}
                        className="w-11 h-11 rounded-full bg-zinc-900 border border-[#D4AF37]/30 flex flex-col items-center justify-center p-1 hover:border-[#D4AF37]/60 transition"
                        title="Oracle Health Complication"
                      >
                        <Sparkles className="w-3 h-3 text-[#E5C378]" />
                        <span className="text-[10px] font-mono font-bold text-white leading-none mt-0.5">
                          {oracleInsight.score}
                        </span>
                        <span className="text-[7px] text-zinc-400 font-mono leading-none">GRADE {oracleInsight.grade}</span>
                      </button>

                      {/* Top-Right: Daily Spend Allowance Complication */}
                      <button
                        onClick={() => {
                          setActiveStackIndex(1);
                          if (soundEnabled) soundFx.tap();
                        }}
                        className="w-11 h-11 rounded-full bg-zinc-900 border border-rose-500/40 flex flex-col items-center justify-center p-1 hover:border-rose-400 transition"
                        title="Daily Spend Complication"
                      >
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span className="text-[9px] font-mono font-bold text-white leading-none mt-0.5">
                          {currency}{Math.round(todaySpend)}
                        </span>
                        <span className="text-[7px] text-zinc-400 font-mono leading-none">BURN</span>
                      </button>
                    </div>

                    {/* Center: Concentric Activity Rings */}
                    <div className="flex items-center justify-center relative py-1">
                      <svg className="w-28 h-28 -rotate-90">
                        {/* Ring 1: Burn (Move) */}
                        <circle cx="56" cy="56" r="46" fill="transparent" stroke="#FF1744" strokeWidth="8" opacity="0.2" />
                        <circle
                          cx="56"
                          cy="56"
                          r="46"
                          fill="transparent"
                          stroke="#FF1744"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 46}
                          strokeDashoffset={2 * Math.PI * 46 * (1 - burnPct)}
                          strokeLinecap="round"
                        />

                        {/* Ring 2: Budget (Exercise) */}
                        <circle cx="56" cy="56" r="35" fill="transparent" stroke="#D4D4D8" strokeWidth="8" opacity="0.2" />
                        <circle
                          cx="56"
                          cy="56"
                          r="35"
                          fill="transparent"
                          stroke="#D4D4D8"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 35}
                          strokeDashoffset={2 * Math.PI * 35 * (1 - budgetPct)}
                          strokeLinecap="round"
                        />

                        {/* Ring 3: Streak (Stand) */}
                        <circle cx="56" cy="56" r="24" fill="transparent" stroke="#00E5FF" strokeWidth="8" opacity="0.2" />
                        <circle
                          cx="56"
                          cy="56"
                          r="24"
                          fill="transparent"
                          stroke="#00E5FF"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 24}
                          strokeDashoffset={2 * Math.PI * 24 * (1 - streakPct)}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Center Ring Metrics */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-wider">CAP</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {currency}{dailyGoal}
                        </span>
                      </div>
                    </div>

                    {/* Bottom 2 Corner Complications */}
                    <div className="flex items-center justify-between">
                      {/* Bottom-Left: Vault Subscriptions Due Complication */}
                      <button
                        onClick={() => {
                          setActiveStackIndex(3);
                          if (soundEnabled) soundFx.tap();
                        }}
                        className="w-11 h-11 rounded-full bg-zinc-900 border border-amber-500/40 flex flex-col items-center justify-center p-1 hover:border-amber-400 transition"
                        title="Vault Subscriptions Complication"
                      >
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] font-mono font-bold text-white leading-none mt-0.5">
                          {subscriptions.filter((s) => s.active).length}
                        </span>
                        <span className="text-[7px] text-zinc-400 font-mono leading-none">VAULT</span>
                      </button>

                      {/* Bottom-Right: Streak Days Complication */}
                      <div
                        className="w-11 h-11 rounded-full bg-zinc-900 border border-cyan-500/40 flex flex-col items-center justify-center p-1"
                        title="Streak Days Complication"
                      >
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-mono font-bold text-white leading-none mt-0.5">
                          {streakDays}d
                        </span>
                        <span className="text-[7px] text-zinc-400 font-mono leading-none">STREAK</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* CARD 1: Quick Spend Log (1-Tap WatchOS Action Buttons) */}
                {activeStackIndex === 1 && (
                  <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Quick Log
                      </span>
                      <h4 className="text-xs font-bold text-white">1-Tap Micro-Entries</h4>
                    </div>

                    {/* 4 Large WatchOS Workout-style Action Pills */}
                    <div className="grid grid-cols-2 gap-1.5 my-1">
                      <button
                        onClick={() => triggerQuickLog('Espresso', 180, 'Food & Dining', 'Coffeehouse')}
                        className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 flex items-center gap-2 active:scale-95 transition text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                          <Coffee className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white block">Coffee</span>
                          <span className="text-[9px] font-mono text-zinc-400">{currency}180</span>
                        </div>
                      </button>

                      <button
                        onClick={() => triggerQuickLog('Transit Ride', 250, 'Transportation', 'Uber / Metro')}
                        className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-cyan-500/30 flex items-center gap-2 active:scale-95 transition text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                          <Car className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white block">Transit</span>
                          <span className="text-[9px] font-mono text-zinc-400">{currency}250</span>
                        </div>
                      </button>

                      <button
                        onClick={() => triggerQuickLog('Lunch Meal', 450, 'Food & Dining', 'Bistro')}
                        className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-500/30 flex items-center gap-2 active:scale-95 transition text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-zinc-500/20 text-zinc-400 flex items-center justify-center shrink-0">
                          <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white block">Meal</span>
                          <span className="text-[9px] font-mono text-zinc-400">{currency}450</span>
                        </div>
                      </button>

                      <button
                        onClick={() => triggerQuickLog('Groceries', 850, 'Groceries', 'Supermarket')}
                        className="p-2 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-purple-500/30 flex items-center gap-2 active:scale-95 transition text-left"
                      >
                        <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-white block">Grocery</span>
                          <span className="text-[9px] font-mono text-zinc-400">{currency}850</span>
                        </div>
                      </button>
                    </div>

                    <button
                      onClick={() => setActiveStackIndex(0)}
                      className="w-full py-1 text-[10px] font-mono text-zinc-400 hover:text-white text-center"
                    >
                      ← Back to Watchface
                    </button>
                  </div>
                )}

                {/* CARD 2: Delphic Oracle Health Glance */}
                {activeStackIndex === 2 && (
                  <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-[#E5C378] font-bold uppercase tracking-wider">
                          Oracle Health
                        </span>
                        <span className="text-xs font-mono font-bold text-white px-1.5 py-0.5 rounded bg-[#D4AF37]/20">
                          {oracleInsight.grade}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{oracleInsight.score} / 100</h4>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-300 leading-snug line-clamp-3">
                      {oracleInsight.headline}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-zinc-500 block">Top Recommendation:</span>
                      <p className="text-[10px] text-amber-300 leading-tight">
                        {oracleInsight.recommendations[0] || 'Keep daily discretionary under ceiling.'}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveStackIndex(0)}
                      className="w-full py-1 text-[10px] font-mono text-zinc-400 hover:text-white text-center"
                    >
                      ← Back to Watchface
                    </button>
                  </div>
                )}

                {/* CARD 3: Vault Subscriptions Glance */}
                {activeStackIndex === 3 && (
                  <div className="flex-1 flex flex-col justify-between animate-in fade-in duration-200">
                    <div>
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                        Vault Subscriptions
                      </span>
                      <h4 className="text-xs font-bold text-white">
                        {subscriptions.filter((s) => s.active).length} Active Services
                      </h4>
                    </div>

                    <div className="space-y-1 max-h-[110px] overflow-y-auto no-scrollbar">
                      {subscriptions.slice(0, 3).map((sub) => (
                        <div key={sub.id} className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-[10px]">
                          <span className="text-zinc-200 font-medium truncate max-w-[100px]">{sub.name}</span>
                          <span className="text-amber-400 font-mono font-bold">{currency}{sub.amount}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveStackIndex(0)}
                      className="w-full py-1 text-[10px] font-mono text-zinc-400 hover:text-white text-center"
                    >
                      ← Back to Watchface
                    </button>
                  </div>
                )}

              </div>

              {/* Bottom Page Indicator Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-1 relative z-10">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveStackIndex(idx);
                      if (soundEnabled) soundFx.tap();
                      triggerHaptic('light');
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      activeStackIndex === idx
                        ? 'w-4 bg-orange-400 shadow-[0_0_6px_#f97316]'
                        : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

          {/* Right: Tactile Apple Watch Digital Crown & Side Button */}
          <div className="flex flex-col items-center gap-4 -ml-1 z-0">
            
            {/* Working Digital Crown (with Orange Ultra Accent) */}
            <div
              onMouseDown={handleCrownMouseDown}
              onMouseMove={handleCrownMouseMove}
              onMouseUp={handleCrownMouseUp}
              title="Drag or Click Digital Crown to change Smart Stack view"
              onClick={() => handleCrownScrub(1)}
              className="w-4 h-16 rounded-r-md bg-gradient-to-r from-zinc-600 via-zinc-400 to-zinc-700 border border-zinc-500 shadow-[0_2px_8px_rgba(0,0,0,0.8)] cursor-ns-resize flex flex-col items-center justify-around py-1 group select-none active:scale-95 transition-transform"
            >
              {/* Orange ring accent */}
              <div className="w-full h-1 bg-orange-500 my-0.5 shadow-[0_0_4px_#f97316]" />

              {/* Knurled ridges that rotate dynamically */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-[1.5px] bg-zinc-950/80 rounded-full transition-transform"
                  style={{
                    transform: `translateY(${(Math.sin((crownRotation + i * 36) * (Math.PI / 180)) * 2).toFixed(1)}px)`,
                  }}
                />
              ))}
            </div>

            {/* Side Button */}
            <button
              onClick={() => {
                setActiveStackIndex(0);
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
              }}
              title="Side Button: Return to Watchface"
              className="w-2.5 h-10 rounded-r bg-zinc-600 hover:bg-zinc-500 active:scale-90 transition border border-zinc-500/80 cursor-pointer shadow-md"
            />
          </div>

        </div>

        {/* Bottom Interaction Guide */}
        <div className="mt-4 text-center text-xs text-zinc-400 space-y-1">
          <p className="font-mono text-[11px] text-zinc-300">
            Turn Crown or tap <span className="text-orange-400 font-semibold">Orange Action Button</span> to quick-log
          </p>
          <p className="text-[10px] text-zinc-500">
            Authentic watchOS squircle geometry & interactive complications
          </p>
        </div>

      </div>
    </div>
  );
};
