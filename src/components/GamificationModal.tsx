import React from 'react';
import { X, Trophy, Flame, Award, Shield, Sparkles, Feather } from 'lucide-react';
import { GamificationProfile } from '../types';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: GamificationProfile;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  gamification,
}) => {
  if (!isOpen) return null;

  const nextLevelXp = gamification.level * 200;
  const currentLevelProgress = Math.min(100, Math.round((gamification.xp / nextLevelXp) * 100));

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'feather':
        return <Feather className="w-4 h-4" />;
      case 'sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'flame':
        return <Flame className="w-4 h-4" />;
      case 'shield':
        return <Shield className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
      <div className="w-full max-w-sm rounded-2xl liquid-glass-card p-5 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.1]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#E5C378]" />
            <h3 className="font-sans text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Icarus Rank & Milestones
            </h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level & XP Card */}
        <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.1] text-center">
          <span className="text-[10px] font-mono tracking-widest text-[#E5C378] uppercase">
            LEVEL {gamification.level}
          </span>
          <h2 className="font-sans text-base font-bold text-zinc-100 mt-0.5">
            {gamification.levelTitle}
          </h2>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>XP: {gamification.xp}</span>
              <span>Next: {nextLevelXp} XP</span>
            </div>
            <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#FFF3C4] rounded-full transition-all duration-500"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-xl bg-black/50 border border-white/[0.1]">
            <div className="flex items-center justify-center gap-1 text-[#E5C378] text-xs font-sans font-bold">
              <Flame className="w-4 h-4 text-[#E5C378] fill-[#E5C378]" />
              <span>Active Streak</span>
            </div>
            <div className="font-mono text-lg font-bold text-zinc-100 mt-1">
              {gamification.streakDays} Days
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">budget discipline</span>
          </div>

          <div className="p-3 rounded-xl bg-black/50 border border-white/[0.1]">
            <div className="flex items-center justify-center gap-1 text-zinc-300 text-xs font-sans font-bold">
              <Award className="w-4 h-4 text-[#E5C378]" />
              <span>Max Record</span>
            </div>
            <div className="font-mono text-lg font-bold text-zinc-100 mt-1">
              {gamification.maxStreak} Days
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">all-time best</span>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-2">
          <div className="text-[11px] font-sans font-bold text-zinc-400 uppercase tracking-wider">
            Achievement Badges
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {gamification.badges.map((b) => (
              <div
                key={b.id}
                className={`p-2 rounded-xl border flex items-center gap-2.5 transition ${
                  b.unlocked
                    ? 'bg-white/[0.04] border-white/[0.12] text-zinc-100'
                    : 'bg-black/30 border-zinc-900 text-zinc-600 opacity-60'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                    b.unlocked
                      ? 'bg-white/[0.08] border-white/[0.15] text-[#E5C378]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }`}
                >
                  {getBadgeIcon(b.icon)}
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-semibold flex items-center gap-1.5 truncate">
                    <span>{b.title}</span>
                    {b.unlocked && (
                      <span className="text-[9px] font-mono text-[#E5C378] font-normal">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-zinc-400 truncate">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-bold transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
