import React from 'react';
import { ListPlus, PieChart, Sparkles, Shield, Compass } from 'lucide-react';
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
    <div className="w-full bg-[#030905]/95 backdrop-blur-2xl border-t border-amber-500/15 py-1.5 px-3 select-none pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around">
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
              className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-amber-300'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute inset-0 bg-amber-500/10 rounded-xl border border-amber-500/30 shadow-[0_0_12px_rgba(212,175,55,0.18)]" />
              )}

              <div className="relative z-10 flex flex-col items-center">
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-amber-300' : ''}`} />
                  
                  {/* Badge for upcoming renewals on Vault */}
                  {tab.id === 'vault' && upcomingRenewalsCount > 0 && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-rose-500 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {upcomingRenewalsCount}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] font-cinzel font-bold tracking-wider mt-1 uppercase ${
                  isActive ? 'text-amber-200' : 'text-zinc-500'
                }`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
