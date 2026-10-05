import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, VolumeX, ShieldCheck, ChevronLeft, ChevronRight, Smartphone, Sparkles, Cloud, User as UserIcon } from 'lucide-react';
import { type User as FirebaseUser } from 'firebase/auth';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface IosStatusBarProps {
  currentMonth: string;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenGamification: () => void;
  onOpenDataBackup: () => void;
  onOpenIpaGuide?: () => void;
  onOpenAccountModal?: () => void;
  currentUser?: FirebaseUser | null;
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
  onOpenIpaGuide,
  onOpenAccountModal,
  currentUser,
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
    <header className="w-full bg-[#020603]/80 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-40 select-none pt-safe shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Specular Top-Edge Reflection Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Desktop simulated status bar */}
      <div className="hidden sm:flex max-w-md mx-auto px-5 pt-2 pb-1 items-center justify-between text-xs text-zinc-400">
        <span className="font-semibold text-zinc-200 tracking-tight text-[12px] font-mono">{timeStr}</span>
        
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="flex items-end gap-0.5 h-2.5">
            <span className="w-0.5 h-1 bg-emerald-400 rounded-sm" />
            <span className="w-0.5 h-1.5 bg-cyan-400 rounded-sm" />
            <span className="w-0.5 h-2 bg-purple-400 rounded-sm" />
            <span className="w-0.5 h-2.5 bg-amber-400 rounded-sm" />
          </div>
          <Wifi className="w-3 h-3 text-zinc-300" />
          <Battery className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />
        </div>
      </div>

      {/* App Branding & Controls Toolbar */}
      <div className="max-w-md mx-auto px-4 sm:px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Chromatic RGB Border Brand Icon */}
          <div className="relative group cursor-pointer" onClick={onOpenGamification}>
            <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-emerald-500/40 via-cyan-500/40 via-purple-500/40 to-amber-500/40 blur-[2px] opacity-75 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-8 h-8 rounded-xl bg-[#040e06] border border-white/20 flex items-center justify-center shadow-inner">
              <span className="text-amber-300 font-extrabold text-sm font-cinzel">M</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold tracking-tight text-zinc-100 leading-none font-sans">
                MIcroSpends
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 font-mono text-zinc-300">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Liquid Glass Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Currency Switcher Pill */}
          <button
            id="currency-toggle-btn"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onToggleCurrency();
            }}
            className="w-8 h-8 rounded-xl liquid-glass-pill text-amber-300 text-xs font-bold hover:border-amber-400/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.25)] transition flex items-center justify-center active:scale-90 font-mono"
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
            className="w-8 h-8 rounded-xl liquid-glass-pill text-zinc-300 hover:text-white hover:border-cyan-400/40 hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] transition flex items-center justify-center active:scale-90"
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            aria-label={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Backup / Export Manager */}
          <button
            id="backup-btn"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onOpenDataBackup();
            }}
            className="w-8 h-8 rounded-xl liquid-glass-pill text-zinc-300 hover:text-emerald-400 hover:border-emerald-400/40 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)] transition flex items-center justify-center active:scale-90"
            title="Data Backup & Export"
            aria-label="Data Backup"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Google Auth & Firebase Cloud Sync */}
          {onOpenAccountModal && (
            <button
              id="cloud-account-btn"
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                onOpenAccountModal();
              }}
              className="relative w-8 h-8 rounded-xl liquid-glass-pill text-zinc-300 hover:text-amber-300 hover:border-amber-400/40 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] transition flex items-center justify-center active:scale-90 overflow-hidden"
              title={currentUser ? `Google: ${currentUser.displayName || currentUser.email}` : 'Sign in with Google & Cloud Sync'}
              aria-label="Google Cloud Sync"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google'}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : currentUser ? (
                <div className="w-full h-full flex items-center justify-center bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                </div>
              ) : (
                <Cloud className="w-4 h-4 text-cyan-400" />
              )}
              {/* Online live indicator dot if authenticated */}
              {currentUser && (
                <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_4px_rgba(16,185,129,0.9)]" />
              )}
            </button>
          )}

          {/* iOS IPA Sideload & Build Guide */}
          {onOpenIpaGuide && (
            <button
              id="ipa-guide-btn"
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                onOpenIpaGuide();
              }}
              className="w-8 h-8 rounded-xl liquid-glass-pill text-zinc-300 hover:text-purple-400 hover:border-purple-400/50 hover:shadow-[0_0_14px_rgba(168,85,247,0.25)] transition flex items-center justify-center active:scale-90"
              title="iOS IPA Build & Sideload Guide"
              aria-label="iOS IPA Build & Sideload Guide"
            >
              <Smartphone className="w-4 h-4 text-purple-400" />
            </button>
          )}
        </div>
      </div>

      {/* Month Selector Bar - Liquid Glass Segmented Feel */}
      <div className="max-w-md mx-auto px-4 sm:px-5 pb-2 flex items-center justify-between text-xs border-t border-white/[0.05] pt-1.5">
        <button
          onClick={() => {
            if (soundEnabled) soundFx.tap();
            triggerHaptic('light');
            onPrevMonth();
          }}
          className="py-1 px-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition flex items-center gap-1 active:scale-95 font-mono text-[11px]"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </button>

        {/* Liquid Glass Month Pill with Subtle RGB Accents */}
        <div className="relative group">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 tracking-wide liquid-glass-pill px-3.5 py-1 rounded-xl shadow-inner">
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-amber-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span className="font-mono text-[11px]">{currentMonth}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (soundEnabled) soundFx.tap();
            triggerHaptic('light');
            onNextMonth();
          }}
          className="py-1 px-2.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] transition flex items-center gap-1 active:scale-95 font-mono text-[11px]"
          aria-label="Next month"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
