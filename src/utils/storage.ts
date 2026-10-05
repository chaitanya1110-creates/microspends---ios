import { Transaction, Subscription, AdvisorInsight, GamificationProfile } from '../types';

const TRANSACTIONS_KEY = 'microspends_icarus_transactions_v1';
const SUBSCRIPTIONS_KEY = 'microspends_icarus_subscriptions_v1';
const ORACLE_CACHE_KEY = 'microspends_icarus_oracle_cache_v1';
const GAMIFICATION_KEY = 'microspends_icarus_gamification_v1';
const CURRENCY_KEY = 'microspends_icarus_currency_v1';

export const DEFAULT_CURRENCY = '₹'; // Default to Indian Rupee or $, easily toggleable in settings

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    title: 'Senior Engineering Salary',
    amount: 145000,
    type: 'credit',
    category: 'Income & Salary',
    merchant: 'Stripe Global / Payroll',
    date: '2026-03-01',
    paymentMethod: 'Direct Bank Transfer',
    note: 'March salary deposit',
    createdAt: Date.now() - 15 * 86400000,
  },
  {
    id: 'tx-2',
    title: 'Whole Foods Market',
    amount: 4850,
    type: 'debit',
    category: 'Groceries',
    merchant: 'Whole Foods',
    date: '2026-03-03',
    paymentMethod: 'Apple Pay (Titanium)',
    note: 'Organic produce & proteins',
    createdAt: Date.now() - 14 * 86400000,
  },
  {
    id: 'tx-3',
    title: 'Starbucks Reserve Espresso',
    amount: 420,
    type: 'debit',
    category: 'Food & Dining',
    merchant: 'Starbucks Reserve',
    date: '2026-03-06',
    paymentMethod: 'UPI / Scan',
    note: 'Nitro cold brew & croissant',
    createdAt: Date.now() - 11 * 86400000,
  },
  {
    id: 'tx-4',
    title: 'Design System Consulting',
    amount: 32000,
    type: 'credit',
    category: 'Income & Salary',
    merchant: 'Fintech Studio Labs',
    date: '2026-03-08',
    paymentMethod: 'IMPS Direct',
    note: 'Q1 retainer milestone',
    createdAt: Date.now() - 9 * 86400000,
  },
  {
    id: 'tx-5',
    title: 'Uber Black Airport Ride',
    amount: 1850,
    type: 'debit',
    category: 'Transportation',
    merchant: 'Uber BV',
    date: '2026-03-11',
    paymentMethod: 'Apple Pay',
    note: 'Transit to terminal 2',
    createdAt: Date.now() - 6 * 86400000,
  },
  {
    id: 'tx-6',
    title: 'Apple One Premier Bundle',
    amount: 399,
    type: 'debit',
    category: 'Bills & Utilities',
    merchant: 'Apple Services',
    date: '2026-03-14',
    paymentMethod: 'Auto Debit',
    note: 'iCloud 2TB + Music + Fitness',
    createdAt: Date.now() - 3 * 86400000,
  },
  {
    id: 'tx-7',
    title: 'Gym & Spa Facility Pass',
    amount: 2500,
    type: 'debit',
    category: 'Health & Wellness',
    merchant: 'Equinox Club',
    date: '2026-03-16',
    paymentMethod: 'Credit Card',
    note: 'Monthly health recovery pass',
    createdAt: Date.now() - 1 * 86400000,
  },
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-1',
    name: 'Apple One Premier',
    amount: 399,
    billingCycle: 'monthly',
    nextDueDate: '2026-03-24',
    category: 'Bills & Utilities',
    icon: 'apple',
    active: true,
  },
  {
    id: 'sub-2',
    name: 'Netflix 4K Ultra',
    amount: 649,
    billingCycle: 'monthly',
    nextDueDate: '2026-03-20',
    category: 'Entertainment',
    icon: 'film',
    active: true,
  },
  {
    id: 'sub-3',
    name: 'Equinox Athletic Club',
    amount: 2500,
    billingCycle: 'monthly',
    nextDueDate: '2026-03-28',
    category: 'Health & Wellness',
    icon: 'dumbbell',
    active: true,
  },
  {
    id: 'sub-4',
    name: 'Claude & ChatGPT Pro',
    amount: 1999,
    billingCycle: 'monthly',
    nextDueDate: '2026-04-02',
    category: 'Bills & Utilities',
    icon: 'sparkles',
    active: true,
  },
];

export const INITIAL_GAMIFICATION: GamificationProfile = {
  xp: 450,
  level: 3,
  levelTitle: 'Imperial Sovereign',
  streakDays: 8,
  maxStreak: 14,
  badges: [
    {
      id: 'b-1',
      title: 'First Wing of Icarus',
      description: 'Logged your maiden expense into the obsidian ledger.',
      icon: 'feather',
      unlocked: true,
      unlockedAt: '2026-03-01',
    },
    {
      id: 'b-2',
      title: 'Oracle Inquirer',
      description: 'Consulted the Delphic Oracle for financial leakage audit.',
      icon: 'sparkles',
      unlocked: true,
      unlockedAt: '2026-03-05',
    },
    {
      id: 'b-3',
      title: 'Golden Discipline',
      description: 'Maintained a consecutive 7-day spending streak.',
      icon: 'flame',
      unlocked: true,
      unlockedAt: '2026-03-15',
    },
    {
      id: 'b-4',
      title: 'Vault Sentinel',
      description: 'Locked in 4 recurring commitments with annualized burn tracking.',
      icon: 'shield',
      unlocked: true,
      unlockedAt: '2026-03-12',
    },
    {
      id: 'b-5',
      title: 'Titan of Thrift',
      description: 'Kept discretionary spending under 15% for the month.',
      icon: 'award',
      unlocked: false,
    },
  ],
};

export const INITIAL_ORACLE_INSIGHT: AdvisorInsight = {
  score: 91,
  grade: 'A',
  headline: 'Imperial Equilibrium & High Capital Efficiency',
  summary:
    'Your inflow-to-outflow ratio stands at a formidable 17.5x. Discretionary spending is well-contained under 12% of total reserves. Your recurring Vault commitments total ₹5,547 / month.',
  leakageBreakdown: {
    discretionary: 86,
    subscriptions: 92,
    dining: 78,
    variance: 94,
    discipline: 90,
  },
  recommendations: [
    'Direct 25% of the consulting surplus directly into treasury bonds or index liquidity.',
    'Review Netflix and Claude AI renewals in the Vault due within 7 days.',
    'You are 2 days away from unlocking the "10-Day Streak Sentinel" milestone.',
  ],
  actionItems: [
    'Verify renewal dates in Vault tab',
    'Set a daily ceiling of ₹1,500 on dining',
    'Export obsidian backup to maintain zero data loss',
  ],
  updatedAt: new Date().toISOString(),
};

// Storage APIs
export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch {}
}

export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SUBSCRIPTIONS;
}

export function saveSubscriptions(subs: Subscription[]) {
  try {
    localStorage.setItem(SUBSCRIPTIONS_KEY, JSON.stringify(subs));
  } catch {}
}

export function loadGamification(): GamificationProfile {
  try {
    const raw = localStorage.getItem(GAMIFICATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_GAMIFICATION;
}

export function saveGamification(profile: GamificationProfile) {
  try {
    localStorage.setItem(GAMIFICATION_KEY, JSON.stringify(profile));
  } catch {}
}

export function loadOracleInsight(): AdvisorInsight {
  try {
    const raw = localStorage.getItem(ORACLE_CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_ORACLE_INSIGHT;
}

export function saveOracleInsight(insight: AdvisorInsight) {
  try {
    localStorage.setItem(ORACLE_CACHE_KEY, JSON.stringify(insight));
  } catch {}
}

export function loadCurrency(): string {
  try {
    return localStorage.getItem(CURRENCY_KEY) || DEFAULT_CURRENCY;
  } catch {
    return DEFAULT_CURRENCY;
  }
}

export function saveCurrency(c: string) {
  try {
    localStorage.setItem(CURRENCY_KEY, c);
  } catch {}
}

// Data Migration Manager - Export and Import JSON
export function exportBackupData(): string {
  const data = {
    appName: 'MIcroSpends ~ Icarus',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    currency: loadCurrency(),
    transactions: loadTransactions(),
    subscriptions: loadSubscriptions(),
    gamification: loadGamification(),
    oracleInsight: loadOracleInsight(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.transactions || !Array.isArray(data.transactions)) {
      throw new Error('Invalid backup schema');
    }
    saveTransactions(data.transactions);
    if (data.subscriptions && Array.isArray(data.subscriptions)) {
      saveSubscriptions(data.subscriptions);
    }
    if (data.gamification) {
      saveGamification(data.gamification);
    }
    if (data.oracleInsight) {
      saveOracleInsight(data.oracleInsight);
    }
    if (data.currency) {
      saveCurrency(data.currency);
    }
    return true;
  } catch (err) {
    console.error('Data import failed:', err);
    return false;
  }
}
