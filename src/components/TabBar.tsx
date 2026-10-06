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
  const tabs: { id: TabType; label: string; subLabel: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'entries', label: 'Entries', subLabel: 'Ledger', icon: Compass },
    { id: 'charts', label: 'Charts', subLabel: 'Analytics', icon: PieChart },
    { id: 'oracle', label: 'Oracle', subLabel: 'AI Advisor', icon: Sparkles },
    { id: 'vault', label: 'Vault', subLabel: 'Recurring', icon: ShieldCheck },
  ];

  return (
    <div className="relative w-full select-none pb-safe">
      {/* Haute Horlogerie Complication Chassis */}
      <div className="mx-3.5 mb-2.5 rounded-2xl bg-gradient-to-b from-[#181D1A]/95 to-[#080B09]/98 backdrop-blur-2xl border border-[#D4AF37]/30 py-1 px-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.95)]">
        {/* Chamfered 18k Gold Top Accent Line */}
        <div className="absolute top-0 left-6 right-6 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5D478]/40 to-transparent pointer-events-none" />

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
                className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[68px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive ? 'text-[#F5D478]' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {/* Active Complication Chamber Glow & Ruby Bearing */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/15 to-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/45 shadow-[inset_0_1px_1px_rgba(255,235,170,0.2),0_0_15px_rgba(212,175,55,0.2)] animate-in fade-in duration-200" />
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div className="relative">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isActive ? 'scale-110 text-[#F5D478] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : ''
                      }`}
                    />

                    {/* Ruby jewel indicator when active */}
                    {isActive && (
                      <span className="absolute -top-1 -right-1.5 w-1.5 h-1.5 rounded-full bg-[#E5C378] shadow-[0_0_6px_#D4AF37]" />
                    )}

                    {/* Upcoming renewals alert badge on Vault */}
                    {tab.id === 'vault' && upcomingRenewalsCount > 0 && (
                      <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-gradient-to-r from-rose-600 to-amber-600 text-white font-serif text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)] border border-black">
                        {upcomingRenewalsCount}
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[10px] font-serif font-bold tracking-wider mt-0.5 uppercase ${
                      isActive ? 'gold-leaf-text' : 'text-zinc-400'
                    }`}
                  >
                    {tab.label}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-tighter leading-none">
                    {tab.subLabel}
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
