import React from 'react';
import { ListPlus, PieChart, Sparkles, Shield } from 'lucide-react';
import { TabType } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface TabBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  soundEnabled: boolean;
  upcomingRenewalsCount: number;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  onChangeTab,
  soundEnabled,
  upcomingRenewalsCount,
}) => {
  const tabs: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'entries', label: 'Entries', icon: ListPlus },
    { id: 'charts', label: 'Charts', icon: PieChart },
    { id: 'oracle', label: 'Oracle', icon: Sparkles },
    { id: 'vault', label: 'Vault', icon: Shield },
  ];

  return (
    <div className="relative w-full select-none pb-safe">
      {/* Floating Apple-Style Liquid Glass Dock Container */}
      <div className="mx-3.5 mb-2.5 rounded-2xl liquid-glass border border-white/[0.12] py-1.5 px-2 shadow-[0_8px_32px_rgba(0,0,0,0.85)]">
        {/* Subtle Specular Top Highlight */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => {
                  if (activeTab !== tab.id) {
                    if (soundEnabled) soundFx.tap();
                    triggerHaptic('light');
                    onChangeTab(tab.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-center min-h-[46px] min-w-[62px] py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-amber-300'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {/* Active Indicator with Subtle RGB Shimmer */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-amber-500/10 rounded-xl border border-amber-500/35 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-in fade-in zoom-in-95 duration-200" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]' : ''}`} />
                    
                    {/* Badge for upcoming renewals on Vault */}
                    {tab.id === 'vault' && upcomingRenewalsCount > 0 && (
                      <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-gradient-to-r from-rose-500 to-purple-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                        {upcomingRenewalsCount}
                      </span>
                    )}
                  </div>

                  <span className={`text-[10px] font-mono font-bold tracking-wider mt-1 uppercase ${
                    isActive ? 'text-amber-200 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]' : 'text-zinc-500'
                  }`}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
