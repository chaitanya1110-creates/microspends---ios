import { Transaction, Subscription, AdvisorInsight, GamificationProfile } from '../types';

const TRANSACTIONS_KEY = 'microspends_icarus_transactions_v2';
const SUBSCRIPTIONS_KEY = 'microspends_icarus_subscriptions_v2';
const ORACLE_CACHE_KEY = 'microspends_icarus_oracle_cache_v2';
const GAMIFICATION_KEY = 'microspends_icarus_gamification_v2';
const CURRENCY_KEY = 'microspends_icarus_currency_v2';

export const DEFAULT_CURRENCY = '₹';

// Date Utilities for Real-Time Dynamic Month Management
export function formatMonthYear(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function parseMonthYear(monthStr: string): Date {
  try {
    const parts = monthStr.trim().split(' ');
    if (parts.length >= 2) {
      const month = parts[0];
      const year = parseInt(parts[1], 10);
      const d = new Date(`${month} 1, ${year}`);
      if (!isNaN(d.getTime())) return d;
    }
  } catch {}
  return new Date();
}

export function getAdjacentMonth(currentMonthStr: string, delta: number): string {
  const d = parseMonthYear(currentMonthStr);
  d.setMonth(d.getMonth() + delta);
  return formatMonthYear(d);
}

export function isDateInMonth(dateStr: string, targetMonthStr: string): boolean {
  try {
    const [y, m] = dateStr.split('-');
    if (!y || !m) return false;
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return formatMonthYear(d).toLowerCase() === targetMonthStr.toLowerCase();
  } catch {
    return false;
  }
}

export function getRelativeDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getRelativeFutureDateStr(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getInitialTransactions(): Transaction[] {
  const currentMonthLabel = formatMonthYear();
  return [
    {
      id: 'tx-1',
      title: 'Senior Engineering Retainer',
      amount: 145000,
      type: 'credit',
      category: 'Income & Salary',
      merchant: 'Stripe Global / Payroll',
      date: getRelativeDateStr(14),
      paymentMethod: 'Direct Bank Transfer',
      note: `${currentMonthLabel} direct compensation`,
      createdAt: Date.now() - 14 * 86400000,
    },
    {
      id: 'tx-2',
      title: 'Whole Foods Market',
      amount: 4850,
      type: 'debit',
      category: 'Groceries',
      merchant: 'Whole Foods',
      date: getRelativeDateStr(12),
      paymentMethod: 'Apple Pay (Titanium)',
      note: 'Organic produce & proteins',
      createdAt: Date.now() - 12 * 86400000,
    },
    {
      id: 'tx-3',
      title: 'Starbucks Reserve Espresso',
      amount: 420,
      type: 'debit',
      category: 'Food & Dining',
      merchant: 'Starbucks Reserve',
      date: getRelativeDateStr(8),
      paymentMethod: 'UPI / Scan',
      note: 'Nitro cold brew & croissant',
      createdAt: Date.now() - 8 * 86400000,
    },
    {
      id: 'tx-4',
      title: 'Design System Advisory',
      amount: 32000,
      type: 'credit',
      category: 'Income & Salary',
      merchant: 'Fintech Studio Labs',
      date: getRelativeDateStr(5),
      paymentMethod: 'IMPS Direct',
      note: 'Retainer milestone payout',
      createdAt: Date.now() - 5 * 86400000,
    },
    {
      id: 'tx-5',
      title: 'Uber Black Ride',
      amount: 1850,
      type: 'debit',
      category: 'Transportation',
      merchant: 'Uber BV',
      date: getRelativeDateStr(3),
      paymentMethod: 'Apple Pay',
      note: 'Executive airport transfer',
      createdAt: Date.now() - 3 * 86400000,
    },
    {
      id: 'tx-6',
      title: 'Apple One Premier Bundle',
      amount: 399,
      type: 'debit',
      category: 'Bills & Utilities',
      merchant: 'Apple Services',
      date: getRelativeDateStr(2),
      paymentMethod: 'Auto Debit',
      note: 'iCloud 2TB + Music + Fitness',
      createdAt: Date.now() - 2 * 86400000,
    },
    {
      id: 'tx-7',
      title: 'Equinox Club Pass',
      amount: 2500,
      type: 'debit',
      category: 'Health & Wellness',
      merchant: 'Equinox Club',
      date: getRelativeDateStr(0),
      paymentMethod: 'Credit Card',
      note: 'Monthly wellness recovery pass',
      createdAt: Date.now(),
    },
  ];
}

export function getInitialSubscriptions(): Subscription[] {
  return [
    {
      id: 'sub-1',
      name: 'Apple One Premier',
      amount: 399,
      billingCycle: 'monthly',
      nextDueDate: getRelativeFutureDateStr(6),
      category: 'Bills & Utilities',
      icon: 'apple',
      active: true,
    },
    {
      id: 'sub-2',
      name: 'Netflix 4K Ultra',
      amount: 649,
      billingCycle: 'monthly',
      nextDueDate: getRelativeFutureDateStr(12),
      category: 'Entertainment',
      icon: 'film',
      active: true,
    },
    {
      id: 'sub-3',
      name: 'Equinox Athletic Club',
      amount: 2500,
      billingCycle: 'monthly',
      nextDueDate: getRelativeFutureDateStr(18),
      category: 'Health & Wellness',
      icon: 'dumbbell',
      active: true,
    },
    {
      id: 'sub-4',
      name: 'AI Intelligence Suite',
      amount: 1999,
      billingCycle: 'monthly',
      nextDueDate: getRelativeFutureDateStr(24),
      category: 'Bills & Utilities',
      icon: 'sparkles',
      active: true,
    },
  ];
}

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
      unlockedAt: getRelativeDateStr(14),
    },
    {
      id: 'b-2',
      title: 'Oracle Inquirer',
      description: 'Consulted the Delphic Oracle for financial leakage audit.',
      icon: 'sparkles',
      unlocked: true,
      unlockedAt: getRelativeDateStr(8),
    },
    {
      id: 'b-3',
      title: 'Golden Discipline',
      description: 'Maintained a consecutive 7-day spending streak.',
      icon: 'flame',
      unlocked: true,
      unlockedAt: getRelativeDateStr(1),
    },
    {
      id: 'b-4',
      title: 'Vault Sentinel',
      description: 'Locked in recurring commitments with annualized burn tracking.',
      icon: 'shield',
      unlocked: true,
      unlockedAt: getRelativeDateStr(4),
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
    'Your inflow-to-outflow ratio stands at a formidable positive equilibrium. Discretionary spending is well-contained under 12% of total reserves. Your recurring Vault commitments are securely budgeted.',
  leakageBreakdown: {
    discretionary: 86,
    subscriptions: 92,
    dining: 78,
    variance: 94,
    discipline: 90,
  },
  recommendations: [
    'Direct 25% of consulting surplus into high-yield index liquidity.',
    'Review recurring services in Vault tab to prevent forgotten micro-leaks.',
    'Maintain daily tracking streak to unlock the "Streak Sentinel" milestone.',
  ],
  actionItems: [
    'Verify renewal dates in Vault tab',
    'Set a daily ceiling of ₹1,500 on discretionary dining',
    'Export obsidian backup or sync to Google Cloud Firestore',
  ],
  updatedAt: new Date().toISOString(),
};

// Storage APIs with fallback & migration
export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getInitialTransactions();
}

export function saveTransactions(txs: Transaction[]) {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch {}
}

export function loadSubscriptions(): Subscription[] {
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return getInitialSubscriptions();
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
    version: '2.0.0',
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
