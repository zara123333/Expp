export type TransactionType = 'Income' | 'Expense' | 'Transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // ISO format: YYYY-MM-DDTHH:mm
  account?: string;
  from?: string;
  to?: string;
  category?: string;
  subCategory?: string;
  note?: string;
}

export interface FavoriteTemplate {
  id: string;
  type: TransactionType;
  category: string;
  subCategory?: string;
  amount: number;
}

export interface CategoriesMap {
  Expense: Record<string, string[]>;
  Income: Record<string, string[]>;
}

export interface FinanceState {
  currentYear: number;
  currentMonth: number; // 0-indexed: 0 = Jan, 10 = Nov
  selectedCalendarDate: string;
  accounts: Record<string, number>;
  openingBalances: Record<string, number>;
  categories: CategoriesMap;
  favorites: FavoriteTemplate[];
  transactions: Transaction[];
}

export type TransSubTab = 'daily' | 'calendar' | 'monthly' | 'total';
export type NavScreen = 'transactions' | 'stats' | 'accounts' | 'more';
