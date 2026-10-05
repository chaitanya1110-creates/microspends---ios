import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, VolumeX, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface IosStatusBarProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenGamification: () => void;
  onOpenDataBackup: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  currency: string;
  onToggleCurrency: () => void;
}

export const IosStatusBar: React.FC<IosStatusBarProps> = ({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  onOpenGamification,
  onOpenDataBackup,
  soundEnabled,
  onToggleSound,
  currency,
  onToggleCurrency,
}) => {
  const [timeStr, setTimeStr] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-[#020403]/90 backdrop-blur-xl border-b border-zinc-900/80 sticky top-0 z-40 select-none pt-safe">
      {/* Desktop simulated status bar (hidden on real mobile screens to prevent double-status bar) */}
      <div className="hidden sm:flex max-w-md mx-auto px-5 pt-2 pb-1 items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-200 tracking-tight text-[12px]">{timeStr}</span>
        
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="flex items-end gap-0.5 h-2.5">
            <span className="w-0.5 h-1 bg-zinc-400 rounded-sm" />
            <span className="w-0.5 h-1.5 bg-zinc-400 rounded-sm" />
            <span className="w-0.5 h-2 bg-zinc-400 rounded-sm" />
            <span className="w-0.5 h-2.5 bg-zinc-400 rounded-sm" />
          </div>
          <Wifi className="w-3 h-3 text-zinc-300" />
          <Battery className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />
        </div>
      </div>

      {/* App Branding & Controls Toolbar */}
      <div className="max-w-md mx-auto px-4 sm:px-5 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/25 to-emerald-500/10 border border-amber-500/35 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <span className="text-amber-300 font-bold text-sm tracking-wider">M</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-100 leading-none">
              MIcroSpends
            </h1>
          </div>
        </div>

        {/* Clean, Accessible Touch Targets (Minimum 38px touch targets for mobile) */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <button
            id="currency-toggle-btn"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onToggleCurrency();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900/90 border border-zinc-800 text-amber-300 text-xs font-semibold hover:border-amber-500/40 transition flex items-center justify-center active:scale-95"
            title="Toggle Currency"
            aria-label="Toggle Currency"
          >
            {currency}
          </button>

          {/* Sound Synthesizer Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) soundFx.goldChime();
              triggerHaptic('light');
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition flex items-center justify-center active:scale-95"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            aria-label={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Backup / Export Manager */}
          <button
            id="backup-btn"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onOpenDataBackup();
            }}
            className="w-8 h-8 rounded-xl bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition flex items-center justify-center active:scale-95"
            title="Data Backup"
            aria-label="Data Backup"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Selector Bar - Native Segmented Feel */}
      <div className="max-w-md mx-auto px-4 sm:px-5 pb-2 flex items-center justify-between text-xs border-t border-zinc-900/60 pt-1.5">
        <button
          onClick={() => {
            if (soundEnabled) soundFx.tap();
            triggerHaptic('light');
            onPrevMonth();
          }}
          className="py-1 px-2.5 rounded-lg text-zinc-400 hover:text-zinc-200 active:bg-zinc-800/60 transition flex items-center gap-1 active:scale-95"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[11px] font-medium">Prev</span>
        </button>

        <span className="text-xs font-semibold text-zinc-200 tracking-wide bg-zinc-900/70 border border-zinc-800/80 px-3 py-1 rounded-lg">
          {currentMonth}
        </span>

        <button
          onClick={() => {
            if (soundEnabled) soundFx.tap();
            triggerHaptic('light');
            onNextMonth();
          }}
          className="py-1 px-2.5 rounded-lg text-zinc-400 hover:text-zinc-200 active:bg-zinc-800/60 transition flex items-center gap-1 active:scale-95"
          aria-label="Next month"
        >
          <span className="text-[11px] font-medium">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
