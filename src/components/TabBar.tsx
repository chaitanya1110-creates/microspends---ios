import React from 'react';
import { Compass, PieChart, Sparkles, ShieldCheck } from 'lucide-react';
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
    { id: 'entries', label: 'Entries', icon: Compass },
    { id: 'charts', label: 'Charts', icon: PieChart },
    { id: 'oracle', label: 'Oracle', icon: Sparkles },
    { id: 'vault', label: 'Vault', icon: ShieldCheck },
  ];

  return (
    <div className="relative w-full select-none pb-safe">
      <div className="mx-3.5 mb-2.5 rounded-2xl liquid-glass-card border border-white/[0.1] py-1.5 px-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.9)]">
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
                className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[64px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-[#F5D478]' : 'text-zinc-500 hover:text-zinc-400'
                }`}
              >
                {/* Active Tab Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-zinc-900/40 rounded-xl border border-zinc-800 shadow-[0_0_10px_rgba(212,175,55,0.06)] animate-in fade-in duration-200" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isActive ? 'scale-105 text-[#F5D478]' : ''
                      }`}
                    />

                    {/* Upcoming renewals alert badge on Vault */}
                    {tab.id === 'vault' && upcomingRenewalsCount > 0 && (
                      <span className="absolute -top-1.5 -right-3 w-3.5 h-3.5 bg-rose-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center border border-black">
                        {upcomingRenewalsCount}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[9px] font-mono tracking-wider mt-0.5 uppercase ${
                      isActive ? 'text-[#F5D478]' : 'text-zinc-500'
                    }`}
                  >
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
