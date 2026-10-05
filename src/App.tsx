import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  Subscription, 
  AdvisorInsight, 
  GamificationProfile, 
  TabType 
} from './types';
import { 
  loadTransactions, 
  saveTransactions, 
  loadSubscriptions, 
  saveSubscriptions, 
  loadGamification, 
  saveGamification, 
  loadOracleInsight, 
  saveOracleInsight, 
  loadCurrency, 
  saveCurrency 
} from './utils/storage';
import { IosStatusBar } from './components/IosStatusBar';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { AccountCardsRow } from './components/AccountCardsRow';
import { TabBar } from './components/TabBar';
import { EntriesTab } from './components/EntriesTab';
import { ChartsTab } from './components/ChartsTab';
import { OracleTab } from './components/OracleTab';
import { VaultTab } from './components/VaultTab';
import { IpaCompilationModal } from './components/IpaCompilationModal';
import { GamificationModal } from './components/GamificationModal';
import { DataMigrationModal } from './components/DataMigrationModal';
import { IosShortcutsModal } from './components/IosShortcutsModal';
import { GoldenParticlesBackground } from './components/GoldenParticlesBackground';
import { soundFx } from './utils/audio';
import { triggerHaptic } from './utils/haptics';
import { MessageSquare, CheckCircle2, Sparkles, X } from 'lucide-react';

export default function App() {
  // State Initialization
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(loadSubscriptions);
  const [gamification, setGamification] = useState<GamificationProfile>(loadGamification);
  const [oracleInsight, setOracleInsight] = useState<AdvisorInsight>(loadOracleInsight);
  const [currency, setCurrency] = useState<string>(loadCurrency);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active view tab & month
  const [activeTab, setActiveTab] = useState<TabType>('entries');
  const [currentMonth, setCurrentMonth] = useState<string>('March 2026');

  // Automatic Message Sync State
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(true);
  const [isScanningClipboard, setIsScanningClipboard] = useState<boolean>(false);
  const [autoSmsToast, setAutoSmsToast] = useState<{
    title: string;
    amount: number;
    type: 'debit' | 'credit';
    merchant: string;
    source: string;
  } | null>(null);

  // Modals
  const [isIpaModalOpen, setIsIpaModalOpen] = useState<boolean>(false);
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState<boolean>(false);
  const [isDataBackupModalOpen, setIsDataBackupModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Synchronize state changes to offline storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveSubscriptions(subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveGamification(gamification);
  }, [gamification]);

  useEffect(() => {
    saveOracleInsight(oracleInsight);
  }, [oracleInsight]);

  useEffect(() => {
    saveCurrency(currency);
  }, [currency]);

  // Aggregate Metrics
  const totalDebited = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredited = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCredited - totalDebited;

  // Upcoming renewals count in next 7 days
  const today = new Date('2026-03-16');
  const upcomingRenewalsCount = subscriptions.filter((s) => {
    if (!s.active) return false;
    const due = new Date(s.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  // Action: Add new transaction
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const fullTx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      createdAt: Date.now(),
    };

    setTransactions((prev) => [fullTx, ...prev]);

    // Award XP and maintain streaks
    setGamification((prev) => {
      const addedXp = newTx.type === 'credit' ? 35 : 20;
      const newXp = prev.xp + addedXp;
      const nextLevelReq = prev.level * 200;
      const leveledUp = newXp >= nextLevelReq;
      const newLevel = leveledUp ? prev.level + 1 : prev.level;
      let newTitle = prev.levelTitle;

      if (newLevel === 2) newTitle = 'Gold Disciple';
      else if (newLevel === 3) newTitle = 'Imperial Sovereign';
      else if (newLevel >= 4) newTitle = 'Icarus Ascendant';

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        levelTitle: newTitle,
      };
    });
  };

  // Helper: Show Auto-Captured Toast Notification
  const showAutoSmsToast = (
    tx: { title: string; amount: number; type: 'debit' | 'credit'; merchant: string },
    source: string
  ) => {
    setAutoSmsToast({
      title: tx.title,
      amount: tx.amount,
      type: tx.type,
      merchant: tx.merchant,
      source,
    });
    setTimeout(() => {
      setAutoSmsToast(null);
    }, 4500);
  };

  // 1. Background Poller: Automatically ingest incoming messages from iOS Shortcuts webhook
  useEffect(() => {
    if (!isAutoSyncActive) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sms/pending');
        if (!res.ok) return;
        const data = await res.json();
        if (data.pending && data.pending.length > 0) {
          const idsToMark: string[] = [];
          for (const item of data.pending) {
            if (item.transaction) {
              handleAddTransaction(item.transaction);
              if (soundEnabled) {
                if (item.transaction.type === 'credit') soundFx.goldChime();
                else soundFx.debitChirp();
              }
              triggerHaptic('success');
              showAutoSmsToast(item.transaction, item.sender || 'iOS Bank SMS');
            }
            idsToMark.push(item.id);
          }

          // Mark processed
          await fetch('/api/sms/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsToMark }),
          });
        }
      } catch (err) {
        // Silent background polling
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoSyncActive, soundEnabled]);

  // Helper: Detect if a text string looks like a bank transaction alert
  const isLikelyBankAlert = (text: string): boolean => {
    if (!text || text.length < 15 || text.length > 500) return false;
    const lower = text.toLowerCase();
    const hasFinancialAction =
      lower.includes('debited') ||
      lower.includes('credited') ||
      lower.includes('spent') ||
      lower.includes('paid') ||
      lower.includes('withdrawn') ||
      lower.includes('deposited') ||
      lower.includes('charged') ||
      lower.includes('sent');
    const hasFinancialContext =
      lower.includes('inr') ||
      lower.includes('rs') ||
      lower.includes('usd') ||
      lower.includes('$') ||
      lower.includes('₹') ||
      lower.includes('a/c') ||
      lower.includes('acct') ||
      lower.includes('upi') ||
      lower.includes('card') ||
      lower.includes('bal') ||
      lower.includes('bank');
    return hasFinancialAction && hasFinancialContext;
  };

  // 2. Clipboard Auto-Detector on Window Focus & Manual Trigger
  const lastClipboardRef = React.useRef<string>('');

  const processClipboardText = async (text: string) => {
    if (!text || text === lastClipboardRef.current) return;
    if (!isLikelyBankAlert(text)) return;

    lastClipboardRef.current = text;
    setIsScanningClipboard(true);

    try {
      const res = await fetch('/api/gemini/parse-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawSms: text }),
      });
      const data = await res.json();
      if (data.transaction) {
        handleAddTransaction(data.transaction);
        if (soundEnabled) {
          if (data.transaction.type === 'credit') soundFx.goldChime();
          else soundFx.debitChirp();
        }
        triggerHaptic('success');
        showAutoSmsToast(data.transaction, 'Clipboard SMS Auto-Read');
      }
    } catch (err) {
      console.error('Clipboard auto-read error:', err);
    } finally {
      setIsScanningClipboard(false);
    }
  };

  // Trigger clipboard check on window focus
  useEffect(() => {
    if (!isAutoSyncActive) return;

    const handleFocus = async () => {
      if (!navigator.clipboard || !navigator.clipboard.readText) return;
      try {
        const text = await navigator.clipboard.readText();
        processClipboardText(text);
      } catch (err) {
        // Browser clipboard permissions may be blocked on unfocused iframe
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAutoSyncActive]);

  // Action: Manual trigger to scan clipboard immediately
  const handleScanClipboardNow = async () => {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      alert('Clipboard API is not supported in this browser.');
      return;
    }
    setIsScanningClipboard(true);
    triggerHaptic('light');
    try {
      const text = await navigator.clipboard.readText();
      if (isLikelyBankAlert(text)) {
        await processClipboardText(text);
      } else {
        // Parse anyway if user explicitly clicked Scan Clipboard
        const res = await fetch('/api/gemini/parse-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawSms: text }),
        });
        const data = await res.json();
        if (data.transaction) {
          handleAddTransaction(data.transaction);
          if (soundEnabled) soundFx.debitChirp();
          triggerHaptic('success');
          showAutoSmsToast(data.transaction, 'Clipboard Auto-Read');
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    } finally {
      setIsScanningClipboard(false);
    }
  };

  // Action: Trigger simulated incoming bank SMS to test auto-flow
  const handleTriggerSimulatedSms = async () => {
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/sms/simulate-incoming', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.alert?.transaction) {
        handleAddTransaction(data.alert.transaction);
        if (soundEnabled) {
          if (data.alert.transaction.type === 'credit') soundFx.goldChime();
          else soundFx.debitChirp();
        }
        triggerHaptic('success');
        showAutoSmsToast(data.alert.transaction, 'Simulated Bank SMS');
      }
    } catch (err) {
      console.error('Simulate SMS failed:', err);
    }
  };

  // Action: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Action: Add subscription
  const handleAddSubscription = (sub: Omit<Subscription, 'id'>) => {
    const fullSub: Subscription = {
      ...sub,
      id: `sub-${Date.now()}`,
    };
    setSubscriptions((prev) => [...prev, fullSub]);

    setGamification((prev) => ({
      ...prev,
      xp: prev.xp + 40,
    }));
  };

  // Action: Delete subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Action: 1-Tap Log Subscription Renewal as Ledger Expense
  const handleLogRenewalAsExpense = (sub: Subscription) => {
    handleAddTransaction({
      title: `${sub.name} (Renewal)`,
      amount: sub.amount,
      type: 'debit',
      category: sub.category,
      merchant: sub.name,
      paymentMethod: 'Auto Debit',
      note: `Vault renewal logged for ${sub.billingCycle} cycle`,
      date: new Date().toISOString().split('T')[0],
    });
  };

  // Action: Currency toggle
  const handleToggleCurrency = () => {
    setCurrency((prev) => (prev === '₹' ? '$' : '₹'));
  };

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonth('February 2026');
  };
  const handleNextMonth = () => {
    setCurrentMonth('March 2026');
  };

  // Refresh from imported backup
  const handleDataRestored = () => {
    setTransactions(loadTransactions());
    setSubscriptions(loadSubscriptions());
    setGamification(loadGamification());
    setOracleInsight(loadOracleInsight());
    setCurrency(loadCurrency());
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-[#020403] text-zinc-100 flex flex-col items-center justify-start antialiased selection:bg-amber-500/30 overflow-x-hidden">
      {/* Flowing Golden Particles Ambient Background */}
      <GoldenParticlesBackground />

      {/* Mobile Shell / iOS Device Container */}
      <div className="w-full max-w-md min-h-[100dvh] flex flex-col bg-[#020403]/90 backdrop-blur-[2px] shadow-[0_0_80px_rgba(0,0,0,0.95)] sm:border-x sm:border-zinc-900/80 border-x-0 relative z-10">
        
        {/* Persistent iOS Header & Month Selector */}
        <IosStatusBar
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onOpenGamification={() => setIsGamificationModalOpen(true)}
          onOpenDataBackup={() => setIsDataBackupModalOpen(true)}
          onOpenIpaGuide={() => setIsIpaModalOpen(true)}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          currency={currency}
          onToggleCurrency={handleToggleCurrency}
        />

        {/* Dynamic iOS Notification Toast for Auto-Captured SMS */}
        {autoSmsToast && (
          <div className="mx-4 -mb-1 mt-1 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/90 to-black border border-emerald-500/40 shadow-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-400">
                    Auto-Captured SMS
                  </span>
                  <span className="text-[10px] text-zinc-500">•</span>
                  <span className="text-[10px] text-zinc-400">{autoSmsToast.source}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>{autoSmsToast.title}</span>
                  <span className={autoSmsToast.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}>
                    {autoSmsToast.type === 'credit' ? '+' : '-'}{currency}{autoSmsToast.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setAutoSmsToast(null)}
              className="p-1 text-zinc-500 hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Scrollable Content Viewport */}
        <main className="flex-1 px-3.5 sm:px-4 py-3 space-y-3 pb-32 overflow-y-auto ios-momentum-scroll">
          {/* 1. Top Hero: Current Net Balance & Dynamic Spline Wave */}
          <HeroBalanceCard
            totalCredited={totalCredited}
            totalDebited={totalDebited}
            netBalance={netBalance}
            currency={currency}
            transactionCount={transactions.length}
          />

          {/* 2. Dual Account Cards: Total Debited & Credited Outflow */}
          <AccountCardsRow
            totalDebited={totalDebited}
            totalCredited={totalCredited}
            currency={currency}
          />

          {/* 3. Dynamic Active View Tab */}
          <section className="pt-1">
            {activeTab === 'entries' && (
              <EntriesTab
                transactions={transactions}
                onAddTransaction={handleAddTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                currency={currency}
                soundEnabled={soundEnabled}
                isAutoSyncActive={isAutoSyncActive}
                onToggleAutoSync={() => setIsAutoSyncActive((prev) => !prev)}
                onTriggerSimulatedSms={handleTriggerSimulatedSms}
                onScanClipboardNow={handleScanClipboardNow}
                isScanningClipboard={isScanningClipboard}
                onOpenShortcutsGuide={() => setIsShortcutsModalOpen(true)}
              />
            )}

            {activeTab === 'charts' && (
              <ChartsTab
                transactions={transactions}
                currency={currency}
              />
            )}

            {activeTab === 'oracle' && (
              <OracleTab
                insight={oracleInsight}
                onUpdateInsight={setOracleInsight}
                transactions={transactions}
                subscriptions={subscriptions}
                currency={currency}
                soundEnabled={soundEnabled}
              />
            )}

            {activeTab === 'vault' && (
              <VaultTab
                subscriptions={subscriptions}
                onAddSubscription={handleAddSubscription}
                onDeleteSubscription={handleDeleteSubscription}
                onLogRenewalAsExpense={handleLogRenewalAsExpense}
                currency={currency}
                soundEnabled={soundEnabled}
              />
            )}
          </section>
        </main>

        {/* Persistent 4-Way Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-md z-40">
          <TabBar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            soundEnabled={soundEnabled}
            upcomingRenewalsCount={upcomingRenewalsCount}
          />
        </div>

        {/* Modals */}
        <IosShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
          onTestSimulation={handleTriggerSimulatedSms}
        />

        <IpaCompilationModal
          isOpen={isIpaModalOpen}
          onClose={() => setIsIpaModalOpen(false)}
          soundEnabled={soundEnabled}
        />

        <GamificationModal
          isOpen={isGamificationModalOpen}
          onClose={() => setIsGamificationModalOpen(false)}
          gamification={gamification}
        />

        <DataMigrationModal
          isOpen={isDataBackupModalOpen}
          onClose={() => setIsDataBackupModalOpen(false)}
          onDataRestored={handleDataRestored}
          soundEnabled={soundEnabled}
        />
      </div>
    </div>
  );
}

