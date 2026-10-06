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
  saveCurrency,
  formatMonthYear,
  getAdjacentMonth,
  isDateInMonth
} from './utils/storage';
import { 
  auth, 
  fetchUserTransactions, 
  saveUserTransactionToFirestore, 
  deleteUserTransactionFromFirestore,
  fetchUserSubscriptions, 
  saveUserSubscriptionToFirestore, 
  deleteUserSubscriptionFromFirestore,
  syncUserDoc,
  handleAuthRedirect
} from './firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { getApiUrl } from './utils/api';
import { IosStatusBar } from './components/IosStatusBar';
import { HeroBalanceCard } from './components/HeroBalanceCard';
import { AccountCardsRow } from './components/AccountCardsRow';
import { TabBar } from './components/TabBar';
import { EntriesTab } from './components/EntriesTab';
import { ChartsTab } from './components/ChartsTab';
import { OracleTab } from './components/OracleTab';
import { VaultTab } from './components/VaultTab';
import { GamificationModal } from './components/GamificationModal';
import { DataMigrationModal } from './components/DataMigrationModal';
import { IosShortcutsModal } from './components/IosShortcutsModal';
import { AccountModal } from './components/AccountModal';
import { DynamicHueBackground } from './components/DynamicHueBackground';
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

  // Active view tab & real dynamic month
  const [activeTab, setActiveTab] = useState<TabType>('entries');
  const [currentMonth, setCurrentMonth] = useState<string>(() => formatMonthYear(new Date()));

  // Google Auth & Cloud Sync State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

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
  const [isGamificationModalOpen, setIsGamificationModalOpen] = useState<boolean>(false);
  const [isDataBackupModalOpen, setIsDataBackupModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // Synchronize Firebase Auth state and cloud data
  useEffect(() => {
    // Handle redirect result first
    handleAuthRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncUserDoc(user, currency);
        try {
          setIsCloudSyncing(true);
          const cloudTxs = await fetchUserTransactions(user.uid);
          const cloudSubs = await fetchUserSubscriptions(user.uid);

          // Reconcile Sync: Only update local state if cloud fetch was successful (not null)
          if (cloudTxs !== null) {
            if (cloudTxs.length > 0) {
              setTransactions(cloudTxs);
            } else if (transactions.length > 0) {
              // Cloud is verified empty, and we have local data: push local to cloud
              console.log('Sync: Cloud empty, pushing local transactions...');
              for (const tx of transactions) {
                await saveUserTransactionToFirestore(user.uid, tx);
              }
            }
          }

          if (cloudSubs !== null) {
            if (cloudSubs.length > 0) {
              setSubscriptions(cloudSubs);
            } else if (subscriptions.length > 0) {
              // Cloud is verified empty: push local subscriptions
              console.log('Sync: Cloud empty, pushing local subscriptions...');
              for (const sub of subscriptions) {
                await saveUserSubscriptionToFirestore(user.uid, sub);
              }
            }
          }
        } catch (err) {
          console.error('Initial Firestore cloud sync error:', err);
        } finally {
          setIsCloudSyncing(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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

  // Push all local data to Cloud Firestore
  const handlePushToCloud = async () => {
    if (!currentUser) return;
    setIsCloudSyncing(true);
    try {
      await syncUserDoc(currentUser, currency);
      for (const tx of transactions) {
        await saveUserTransactionToFirestore(currentUser.uid, tx);
      }
      for (const sub of subscriptions) {
        await saveUserSubscriptionToFirestore(currentUser.uid, sub);
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Pull / restore all data from Cloud Firestore
  const handlePullFromCloud = async () => {
    if (!currentUser) return;
    setIsCloudSyncing(true);
    try {
      const cloudTxs = await fetchUserTransactions(currentUser.uid);
      const cloudSubs = await fetchUserSubscriptions(currentUser.uid);
      if (cloudTxs !== null && cloudTxs.length > 0) setTransactions(cloudTxs);
      if (cloudSubs !== null && cloudSubs.length > 0) setSubscriptions(cloudSubs);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // Month-filtered transactions & real metrics strictly for selected month
  const currentMonthTransactions = transactions.filter((t) => isDateInMonth(t.date, currentMonth));
  
  // Real-data metrics strictly for the active month (0 if no data in this month)
  const totalDebited = currentMonthTransactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredited = currentMonthTransactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalCredited - totalDebited;

  // Upcoming renewals count in next 7 days based on real-time current date
  const today = new Date();
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

    // Cloud Firestore Sync
    if (currentUser) {
      saveUserTransactionToFirestore(currentUser.uid, fullTx).catch(console.error);
    }

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

  // Action: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    if (currentUser) {
      deleteUserTransactionFromFirestore(currentUser.uid, id).catch(console.error);
    }
  };

  // Action: Toggle subscription status
  const handleToggleSubscription = (id: string) => {
    const updated = subscriptions.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSubscriptions(updated);
    if (currentUser) {
      const target = updated.find((s) => s.id === id);
      if (target) saveUserSubscriptionToFirestore(currentUser.uid, target).catch(console.error);
    }
  };

  // Action: Add subscription
  const handleAddSubscription = (newSub: Omit<Subscription, 'id'>) => {
    const subWithId: Subscription = {
      ...newSub,
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    };
    setSubscriptions((prev) => [subWithId, ...prev]);
    if (currentUser) {
      saveUserSubscriptionToFirestore(currentUser.uid, subWithId).catch(console.error);
    }
  };

  // Action: Delete subscription
  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    if (currentUser) {
      deleteUserSubscriptionFromFirestore(currentUser.uid, id).catch(console.error);
    }
  };

  // Action: Log recurring renewal
  const handleLogRenewalAsExpense = (sub: Subscription) => {
    handleAddTransaction({
      title: `${sub.name} (Auto-Renewal)`,
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

  // Month navigation (real dynamic shifts)
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => getAdjacentMonth(prev, -1));
  };
  const handleNextMonth = () => {
    setCurrentMonth((prev) => getAdjacentMonth(prev, 1));
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

  // Background Poller: Automatically ingest incoming messages from iOS Shortcuts webhook
  useEffect(() => {
    if (!isAutoSyncActive) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(getApiUrl('/api/sms/pending'));
        if (!res.ok) return;
        const data = await res.json();
        const pending = data?.pending || [];

        if (pending.length > 0) {
          const idsToMark: string[] = [];

          for (const item of pending) {
            idsToMark.push(item.id);
            if (item.transaction) {
              handleAddTransaction(item.transaction);
              showAutoSmsToast(item.transaction, item.sender || 'Live Bank Alert');

              if (soundEnabled) {
                if (item.transaction.type === 'credit') {
                  soundFx.goldChime();
                } else {
                  soundFx.debitChirp();
                }
              }
              triggerHaptic('success');
            }
          }

          await fetch(getApiUrl('/api/sms/mark-read'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: idsToMark }),
          });
        }
      } catch {}
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [isAutoSyncActive, soundEnabled, currentUser]);

  // Trigger simulated incoming bank alert
  const handleTriggerSimulatedSms = async () => {
    try {
      if (soundEnabled) soundFx.tap();
      triggerHaptic('light');

      const res = await fetch(getApiUrl('/api/sms/simulate-incoming'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();

      if (data?.alert?.transaction) {
        handleAddTransaction(data.alert.transaction);
        showAutoSmsToast(data.alert.transaction, 'Simulated Bank SMS');

        if (soundEnabled) {
          if (data.alert.transaction.type === 'credit') {
            soundFx.goldChime();
          } else {
            soundFx.debitChirp();
          }
        }
        triggerHaptic('success');
      }
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  // Clipboard scan handler
  const handleScanClipboardNow = async () => {
    setIsScanningClipboard(true);
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        await handleTriggerSimulatedSms();
        return;
      }

      const text = await navigator.clipboard.readText();
      if (!text || text.trim().length < 5) {
        await handleTriggerSimulatedSms();
        return;
      }

      const res = await fetch(getApiUrl('/api/gemini/parse-sms'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawSms: text }),
      });

      if (!res.ok) throw new Error('Failed to parse clipboard');
      const data = await res.json();

      if (data.transaction) {
        handleAddTransaction(data.transaction);
        showAutoSmsToast(data.transaction, 'Clipboard SMS');

        if (soundEnabled) {
          if (data.transaction.type === 'credit') {
            soundFx.goldChime();
          } else {
            soundFx.debitChirp();
          }
        }
        triggerHaptic('success');
      } else {
        await handleTriggerSimulatedSms();
      }
    } catch {
      await handleTriggerSimulatedSms();
    } finally {
      setIsScanningClipboard(false);
    }
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
    <div className="relative min-h-[100dvh] w-full bg-[#030406] text-zinc-100 flex flex-col items-center justify-start antialiased selection:bg-amber-500/30 overflow-x-hidden">
      {/* Changing Hue Dynamic Background Panel */}
      <DynamicHueBackground />

      {/* Main App Container */}
      <div className="w-full max-w-lg md:max-w-2xl lg:max-w-3xl min-h-[100dvh] flex flex-col bg-transparent relative z-10 sm:border-x sm:border-white/[0.08] border-x-0">
        
        {/* Persistent iOS Header & Month Selector */}
        <IosStatusBar
          currentMonth={currentMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onOpenGamification={() => setIsGamificationModalOpen(true)}
          onOpenDataBackup={() => setIsDataBackupModalOpen(true)}
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          currentUser={currentUser}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          currency={currency}
          onToggleCurrency={handleToggleCurrency}
        />

        {/* Dynamic iOS Notification Toast for Auto-Captured SMS */}
        {autoSmsToast && (
          <div className="mx-4 -mb-1 mt-1 p-2.5 rounded-xl liquid-glass-card border border-white/[0.12] shadow-xl flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[#E5C378] shrink-0 border border-white/10">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#E5C378]">
                    Auto-Captured SMS
                  </span>
                  <span className="text-[10px] text-zinc-500">•</span>
                  <span className="text-[10px] text-zinc-400">{autoSmsToast.source}</span>
                </div>
                <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>{autoSmsToast.title}</span>
                  <span className={autoSmsToast.type === 'credit' ? 'text-[#E5C378]' : 'text-rose-400'}>
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
            transactionCount={currentMonthTransactions.length}
            currentMonth={currentMonth}
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
                currentMonth={currentMonth}
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
                currentMonth={currentMonth}
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
                onToggleSubscription={handleToggleSubscription}
                onLogRenewalAsExpense={handleLogRenewalAsExpense}
                currency={currency}
                soundEnabled={soundEnabled}
              />
            )}
          </section>
        </main>

        {/* Persistent 4-Way Tab Bar */}
        <div className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-lg md:max-w-2xl lg:max-w-3xl z-40">
          <TabBar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            soundEnabled={soundEnabled}
            upcomingRenewalsCount={upcomingRenewalsCount}
          />
        </div>

        {/* Modals */}
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          currentUser={currentUser}
          onSyncToCloud={handlePushToCloud}
          onRestoreFromCloud={handlePullFromCloud}
          isSyncing={isCloudSyncing}
          soundEnabled={soundEnabled}
          transactionCount={transactions.length}
        />

        <IosShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
          onTestSimulation={handleTriggerSimulatedSms}
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
