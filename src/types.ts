export type TransactionType = 'debit' | 'credit';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Transportation'
  | 'Shopping & Treasury'
  | 'Health & Wellness'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Income & Salary'
  | 'Other';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory | string;
  merchant: string;
  date: string; // YYYY-MM-DD
  paymentMethod: string;
  note?: string;
  createdAt: number;
}

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextDueDate: string; // YYYY-MM-DD
  category: ExpenseCategory | string;
  icon?: string;
  active: boolean;
}

export interface LeakageBreakdown {
  discretionary: number; // 0-100 score
  subscriptions: number;
  dining: number;
  variance: number;
  discipline: number;
}

export interface AdvisorInsight {
  score: number;
  grade: string;
  headline: string;
  summary: string;
  leakageBreakdown: LeakageBreakdown;
  recommendations: string[];
  actionItems: string[];
  updatedAt: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  maxStreak: number;
  badges: Badge[];
}

export type TabType = 'entries' | 'charts' | 'oracle' | 'vault';
