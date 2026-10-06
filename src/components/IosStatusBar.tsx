import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Volume2, VolumeX, ShieldCheck, ChevronLeft, ChevronRight, Smartphone, Cloud, Sparkles } from 'lucide-react';
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
    <header className="w-full bg-[#050706]/95 backdrop-blur-2xl border-b border-[#D4AF37]/20 sticky top-0 z-40 select-none pt-safe shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
      {/* Specular 18k Gold Bezel Rim Line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5D478]/50 to-transparent pointer-events-none" />

      {/* Simulated Swiss Chronometer System Header */}
      <div className="hidden sm:flex max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-5 pt-2 pb-0.5 items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-serif text-[13px] tracking-widest text-[#F5D478] uppercase">CHRONOMETER</span>
          <span className="text-[10px] text-zinc-500">·</span>
          <span className="font-mono text-zinc-300 text-[11px]">{timeStr}</span>
        </div>
        
        <div className="flex items-center gap-2 text-zinc-400">
          <div className="flex items-center gap-1 font-mono text-[9px] text-[#D4AF37]/80 tracking-wider">
            <span>28,800 VPH</span>
          </div>
          <div className="ruby-bearing" title="Ruby Jewel Escapement" />
          <Wifi className="w-3 h-3 text-zinc-300" />
          <Battery className="w-3.5 h-3.5 text-[#E5C378] fill-[#E5C378]" />
        </div>
      </div>

      {/* Haute Horlogerie Crown Bar & Controls */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-3.5 sm:px-5 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* App Icon Emblem */}
          <button 
            type="button"
            className="relative group cursor-pointer active:scale-95 transition-transform" 
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onOpenGamification();
            }}
            title="Imperial Treasury Hallmarks & Achievements"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#1E231C] to-[#0A0D0B] border border-[#D4AF37]/40 flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,235,170,0.3),0_2px_8px_rgba(0,0,0,0.8)] overflow-hidden relative">
              <span className="absolute inset-0 flex items-center justify-center font-serif font-bold text-base text-[#F5D478] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] select-none">
                IC
              </span>
              <img 
                src="/icon.png" 
                alt="micro-spends icarus icon" 
                className="absolute inset-0 w-full h-full object-cover z-10"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            {/* Jewel indicator */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-black shadow-[0_0_6px_#34d399]" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs sm:text-sm font-serif font-bold tracking-wider text-zinc-100 uppercase">
                micro-spends
              </h1>
              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#D4AF37]/10 border border-[#D4AF37]/30 font-mono text-[#F5D478] tracking-widest font-semibold uppercase">
                icarus edition
              </span>
            </div>
            <p className="text-[9px] tracking-widest uppercase text-zinc-500 font-mono">
              PRECISION LEDGER · REAL SPENDS
            </p>
          </div>
        </div>

        {/* Knurled Watch Crown Control Set */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Currency Complication Toggle */}
          <button
            id="currency-toggle-btn"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onToggleCurrency();
            }}
            className="w-8 h-8 rounded-xl knurled-crown text-[#F5D478] text-xs font-serif font-bold transition flex items-center justify-center active:scale-90"
            title="Toggle Currency Standard"
            aria-label="Toggle Currency Standard"
          >
            {currency}
          </button>

          {/* Sound Escapement Chime Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) soundFx.goldChime();
              triggerHaptic('light');
            }}
            className="w-8 h-8 rounded-xl knurled-crown text-zinc-300 hover:text-[#F5D478] transition flex items-center justify-center active:scale-90"
            title={soundEnabled ? 'Mute Mechanical Chimes' : 'Enable Mechanical Chimes'}
            aria-label={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#E5C378]" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
          </button>

          {/* Treasury Vault Backup & Export */}
          <button
            id="backup-btn"
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              onOpenDataBackup();
            }}
            className="w-8 h-8 rounded-xl knurled-crown text-zinc-300 hover:text-emerald-400 transition flex items-center justify-center active:scale-90"
            title="Treasury Archive & Ledger Migration"
            aria-label="Treasury Archive"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </button>

          {/* Google Auth & Cloud Safe */}
          {onOpenAccountModal && (
            <button
              id="cloud-account-btn"
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                onOpenAccountModal();
              }}
              className="relative w-8 h-8 rounded-xl knurled-crown text-zinc-300 hover:text-[#F5D478] transition flex items-center justify-center active:scale-90 overflow-hidden"
              title={currentUser ? `Account Owner: ${currentUser.displayName || currentUser.email}` : 'Sign in with Google Vault'}
              aria-label="Google Cloud Vault"
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Vault Owner'}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : currentUser ? (
                <div className="w-full h-full flex items-center justify-center bg-[#D4AF37]/20 text-[#F5D478] font-serif font-bold text-xs">
                  {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
                </div>
              ) : (
                <Cloud className="w-3.5 h-3.5 text-[#D4AF37]" />
              )}
              {currentUser && (
                <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-black shadow-[0_0_4px_#34d399]" />
              )}
            </button>
          )}

          {/* iOS Native IPA Guide */}
          {onOpenIpaGuide && (
            <button
              id="ipa-guide-btn"
              onClick={() => {
                if (soundEnabled) soundFx.tap();
                triggerHaptic('light');
                onOpenIpaGuide();
              }}
              className="w-8 h-8 rounded-xl knurled-crown text-zinc-300 hover:text-amber-300 transition flex items-center justify-center active:scale-90"
              title="iOS IPA Native Sideload Guide"
              aria-label="iOS IPA Guide"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]/90" />
            </button>
          )}
        </div>
      </div>

      {/* Mechanical Date Complication Bezel Window */}
      <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto px-3.5 sm:px-5 pb-2.5 flex items-center justify-between text-xs border-t border-[#D4AF37]/15 pt-2">
        <button
          onClick={() => {
            if (soundEnabled) soundFx.tap();
            triggerHaptic('light');
            onPrevMonth();
          }}
          className="py-1 px-2.5 rounded-lg text-zinc-400 hover:text-[#F5D478] hover:bg-[#D4AF37]/10 transition flex items-center gap-1 active:scale-95 font-serif text-xs uppercase tracking-wider"
          aria-label="Previous calendar cycle"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Prev</span>
        </button>

        {/* Engine-Turned Date Complication Aperture */}
        <div className="relative group">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-b from-[#121513] to-[#060807] border border-[#D4AF37]/35 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,235,170,0.1)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]" />
            <span className="font-serif text-[13px] font-semibold tracking-wider text-[#FFF3C4] uppercase">
              {currentMonth}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (soundEnabled) soundFx.tap();
            triggerHaptic('light');
            onNextMonth();
          }}
          className="py-1 px-2.5 rounded-lg text-zinc-400 hover:text-[#F5D478] hover:bg-[#D4AF37]/10 transition flex items-center gap-1 active:scale-95 font-serif text-xs uppercase tracking-wider"
          aria-label="Next calendar cycle"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#D4AF37]" />
        </button>
      </div>
    </header>
  );
};
