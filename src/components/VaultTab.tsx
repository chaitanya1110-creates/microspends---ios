import React, { useState } from 'react';
import { ShieldCheck, Plus, Calendar, AlertTriangle, ArrowRight, Check, Trash2, X, RefreshCw } from 'lucide-react';
import { Subscription, BillingCycle, Transaction, ExpenseCategory } from '../types';
import { soundFx } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface VaultTabProps {
  subscriptions: Subscription[];
  onAddSubscription: (sub: Omit<Subscription, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
  onToggleSubscription?: (id: string) => void;
  onLogRenewalAsExpense: (sub: Subscription) => void;
  currency: string;
  soundEnabled: boolean;
}

export const VaultTab: React.FC<VaultTabProps> = ({
  subscriptions,
  onAddSubscription,
  onDeleteSubscription,
  onToggleSubscription,
  onLogRenewalAsExpense,
  currency,
  soundEnabled,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextDueDate, setNextDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [category, setCategory] = useState<ExpenseCategory>('Bills & Utilities');

  // Calculate Monthly Burn & Annualized Burn
  let monthlyBurn = 0;
  subscriptions.filter((s) => s.active).forEach((s) => {
    if (s.billingCycle === 'weekly') monthlyBurn += s.amount * 4.33;
    else if (s.billingCycle === 'monthly') monthlyBurn += s.amount;
    else if (s.billingCycle === 'quarterly') monthlyBurn += s.amount / 3;
    else if (s.billingCycle === 'yearly') monthlyBurn += s.amount / 12;
  });

  const annualizedBurn = monthlyBurn * 12;

  // Check upcoming renewals within 7 days
  const today = new Date();
  const upcomingRenewals = subscriptions.filter((s) => {
    if (!s.active) return false;
    const due = new Date(s.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  const handleSaveSubscription = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;

    onAddSubscription({
      name: name.trim(),
      amount: amt,
      billingCycle,
      nextDueDate,
      category,
      active: true,
    });

    if (soundEnabled) soundFx.goldChime();
    triggerHaptic('success');
    setIsAddModalOpen(false);
    setName('');
    setAmount('');
  };

  return (
    <div className="space-y-4">
      {/* 1. Grand Complication Vault Header */}
      <div className="rounded-2xl p-4 horology-bezel shadow-[0_16px_40px_rgba(0,0,0,0.85)]">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-2">
            <span className="ruby-bearing" />
            <h3 className="font-sans text-[10px] font-bold text-[#E5C378] uppercase tracking-widest">
              Vault · Recurring
            </h3>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg knurled-crown text-xs text-[#F5D478] hover:border-[#D4AF37] transition active:scale-95 font-sans cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="uppercase tracking-wider">+ Add Recurring</span>
          </button>
        </div>

        {/* Dual Complication Chambers */}
        <div className="grid grid-cols-2 gap-3">
          {/* Monthly Burn Chamber */}
          <div className="horology-subdial rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-[#E5C378]">
              Monthly Burn
            </span>
            <div className="font-sans text-lg sm:text-xl font-bold gold-leaf-text mt-0.5">
              {currency}{Math.round(monthlyBurn).toLocaleString()}
            </div>
          </div>

          {/* Annualized Burn Chamber */}
          <div className="horology-subdial rounded-xl p-2.5 flex flex-col justify-between">
            <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-[#E5C378]">
              Annualized
            </span>
            <div className="font-sans text-lg sm:text-xl font-bold text-rose-300/80 mt-0.5">
              {currency}{Math.round(annualizedBurn).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Renewal Alarm Complication (Next 7 Days) */}
      {upcomingRenewals.length > 0 && (
        <div className="rounded-2xl p-4 liquid-glass-card border border-white/[0.12] shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F5D478] animate-pulse" />
              <h4 className="font-sans text-xs font-bold text-[#FFF3C4] uppercase tracking-wider">
                Renewal Alarm · Due in Next 7 Days
              </h4>
            </div>
            <span className="text-[10px] font-sans text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/40 bg-black/40">
              {upcomingRenewals.length} upcoming
            </span>
          </div>

          <div className="space-y-2">
            {upcomingRenewals.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-xl bg-black/70 border border-[#D4AF37]/25 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-sans font-bold text-zinc-100">{sub.name}</span>
                    <span className="text-[10px] font-mono text-[#F5D478]">
                      · Due {sub.nextDueDate}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-zinc-400">
                    {currency}{sub.amount.toLocaleString()} / {sub.billingCycle}
                  </span>
                </div>

                {/* 1-Tap Log as Expense Button */}
                <button
                  onClick={() => {
                    onLogRenewalAsExpense(sub);
                    if (soundEnabled) soundFx.debitChirp();
                    triggerHaptic('success');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 text-black font-sans font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-[#D4AF37]/20 active:scale-95 shrink-0 cursor-pointer"
                  title="Log renewal to ledger"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Log Spend</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Subscriptions Vault List */}
      <div className="rounded-2xl p-4 horology-bezel shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-2">
            <span className="ruby-bearing" />
            <h3 className="font-sans text-xs font-bold text-[#E5C378] uppercase tracking-wider">
              Active Vault Commitments ({subscriptions.length})
            </h3>
          </div>
          <span className="text-[10px] font-sans text-[#D4AF37]/70 uppercase tracking-widest">
            ACTIVE TRACKING
          </span>
        </div>

        {subscriptions.length === 0 ? (
          <div className="py-8 text-center">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-2" />
            <p className="text-xs font-sans text-zinc-300">No recurring commitments in your Vault.</p>
            <p className="text-[11px] font-mono text-zinc-500 mt-1">Add subscriptions like Netflix, iCloud, Gym, or rent.</p>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="mt-3 px-3 py-1.5 rounded-xl bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#F5D478] text-xs font-sans font-semibold transition cursor-pointer"
            >
              + Add First Subscription
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="p-3 rounded-xl bg-gradient-to-b from-[#101512] to-[#070A08] border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#F5D478] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-sans font-bold text-zinc-100">{sub.name}</span>
                      <span className="text-[10px] font-sans text-[#D4AF37] font-medium">
                        · {sub.billingCycle}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      Next Due: {sub.nextDueDate} · {sub.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-sans font-bold text-[#F5D478]">
                      {currency}{sub.amount.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase">{sub.billingCycle}</div>
                  </div>

                  <button
                    onClick={() => {
                      onDeleteSubscription(sub.id);
                      if (soundEnabled) soundFx.deleteDrop();
                      triggerHaptic('heavy');
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    title="Remove from Vault"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl liquid-glass-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D4AF37]/20">
              <h3 className="font-sans text-sm font-bold text-[#FFF3C4] uppercase tracking-wider">
                + New Recurring Vault Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider text-[#E5C378] mb-1">
                  Service / Commitment Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Netflix, iCloud, Gym, Rent..."
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-wider text-[#E5C378] mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-[#E5C378] mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full bg-[#0D120E] border border-[#D4AF37]/30 text-xs rounded-xl p-2.5 text-white focus:outline-none focus:border-[#D4AF37] font-sans"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-wider text-[#E5C378] mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-black/60 border border-[#D4AF37]/30 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-[#D4AF37] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 font-sans cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSubscription}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black font-sans font-bold text-xs shadow-md shadow-[#D4AF37]/30 cursor-pointer"
              >
                Save Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
