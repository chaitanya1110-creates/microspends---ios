import React, { useState } from 'react';
import { Shield, Plus, Calendar, AlertTriangle, ArrowRight, Check, Trash2, X, Sparkles, RefreshCw } from 'lucide-react';
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
      {/* 1. Vault Burn Rate Metrics Header */}
      <div className="rounded-2xl p-4 bg-gradient-to-b from-[#08180c]/90 to-[#020503]/95 border border-amber-500/30 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
              Vault Burn Rate Sentinel
            </h3>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) soundFx.tap();
              triggerHaptic('light');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-medium transition active:scale-95"
          >
            <Plus className="w-3 h-3 text-amber-400" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Monthly Burn */}
          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
            <span className="text-[10px] font-cinzel font-bold text-zinc-400 uppercase tracking-wider">
              Monthly Burn Rate
            </span>
            <div className="font-mono text-lg sm:text-xl font-bold text-amber-300 mt-0.5">
              {currency}{Math.round(monthlyBurn).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">per calendar month</span>
          </div>

          {/* Annualized Burn */}
          <div className="p-3 rounded-xl bg-black/40 border border-zinc-800/80">
            <span className="text-[10px] font-cinzel font-bold text-zinc-400 uppercase tracking-wider">
              Annualized Commitment
            </span>
            <div className="font-mono text-lg sm:text-xl font-bold text-rose-300 mt-0.5">
              {currency}{Math.round(annualizedBurn).toLocaleString()}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">12-month projection</span>
          </div>
        </div>
      </div>

      {/* 2. Renewal Alert Radar (Next 7 Days) */}
      {upcomingRenewals.length > 0 && (
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-950/40 via-[#071309]/80 to-black border border-amber-500/40 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
              <h4 className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider">
                Renewal Alert Radar (Next 7 Days)
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
              {upcomingRenewals.length} Due Soon
            </span>
          </div>

          <div className="space-y-2">
            {upcomingRenewals.map((sub) => (
              <div
                key={sub.id}
                className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-100">{sub.name}</span>
                    <span className="text-[10px] font-mono text-amber-400">
                      Due {sub.nextDueDate}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
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
                  className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold text-[11px] font-mono transition flex items-center gap-1 shadow-md shadow-emerald-950/40 active:scale-95 shrink-0"
                  title="Record renewal into Obsidian ledger"
                >
                  <RefreshCw className="w-3 h-3 stroke-[3]" />
                  <span>Log as Expense</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Subscriptions Vault List */}
      <div className="rounded-2xl p-4 bg-[#030a05]/95 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-cinzel text-xs font-bold text-amber-200 uppercase tracking-wider">
            Active Vault Subscriptions ({subscriptions.length})
          </h3>
          <span className="text-[10px] font-mono text-zinc-500">Auto-Burn Tracking</span>
        </div>

        <div className="space-y-2">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-3 rounded-xl bg-black/40 border border-zinc-800/80 hover:border-amber-500/30 transition flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-100">{sub.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {sub.billingCycle}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                    Next renewal: {sub.nextDueDate} • {sub.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-amber-300">
                    {currency}{sub.amount.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-zinc-500">{sub.billingCycle}</div>
                </div>

                <button
                  onClick={() => {
                    onDeleteSubscription(sub.id);
                    if (soundEnabled) soundFx.deleteDrop();
                    triggerHaptic('heavy');
                  }}
                  className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Remove from Vault"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Subscription Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#030a05] border border-amber-500/30 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-xs font-bold text-amber-300 uppercase">
                Add Vault Subscription
              </span>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">Service Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Netflix, iCloud, Spotify, Gym"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Recurring Amount ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Billing Cycle</label>
                <select
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                  className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">Next Due Date</label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-black/70 border border-zinc-800 rounded-xl py-2 px-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSubscription}
              disabled={!name.trim() || !amount}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs font-mono disabled:opacity-40 transition"
            >
              Lock into Vault
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
