import { FinanceState, Transaction, CategoriesMap, FavoriteTemplate } from '../types/finance';

export const defaultCategories: CategoriesMap = {
  Expense: {
    'Food': ['Groceries', 'Restaurants', 'Coffee'],
    'Transport': ['Fuel', 'Taxi', 'Maintenance'],
    'Shopping': ['Clothing', 'Electronics'],
    'Bills': ['Electricity', 'Internet', 'Rent']
  },
  Income: {
    'Salary': ['Main Job', 'Freelance'],
    'Bonus': ['Incentive', 'Gift'],
    'Petty Cash': ['Allowance', 'Reimbursement']
  }
};

export const defaultFinanceState: FinanceState = {
  currentYear: 2026,
  currentMonth: 10, // November (0-indexed)
  selectedCalendarDate: '2026-11-04',
  accounts: {
    'Cash': 4250.00,
    'Card': 12800.00,
    'UPI': 6120.00
  },
  openingBalances: {
    'Cash': 5000.00,
    'Card': 15000.00,
    'UPI': 5000.00
  },
  categories: defaultCategories,
  favorites: [
    { id: 'fav-1', type: 'Expense', category: 'Food', subCategory: 'Coffee', amount: 180.00 },
    { id: 'fav-2', type: 'Expense', category: 'Transport', subCategory: 'Fuel', amount: 1500.00 }
  ],
  transactions: [
    {
      id: 'tx-1',
      type: 'Expense',
      amount: 450.00,
      date: '2026-11-04T12:30',
      account: 'UPI',
      category: 'Food',
      subCategory: 'Restaurants',
      note: 'Team lunch'
    },
    {
      id: 'tx-2',
      type: 'Expense',
      amount: 120.00,
      date: '2026-11-04T09:15',
      account: 'Cash',
      category: 'Food',
      subCategory: 'Coffee',
      note: 'Morning espresso'
    },
    {
      id: 'tx-3',
      type: 'Transfer',
      amount: 2000.00,
      date: '2026-11-03T16:00',
      from: 'Card',
      to: 'UPI',
      note: 'Wallet top-up'
    },
    {
      id: 'tx-4',
      type: 'Expense',
      amount: 2200.00,
      date: '2026-11-02T19:40',
      account: 'Card',
      category: 'Shopping',
      subCategory: 'Clothing',
      note: 'Winter jacket'
    },
    {
      id: 'tx-5',
      type: 'Income',
      amount: 3500.00,
      date: '2026-11-01T10:00',
      account: 'UPI',
      category: 'Salary',
      subCategory: 'Freelance',
      note: 'Mobile UI consulting'
    }
  ]
};

export function finiteMoney(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : 0;
}

export function transactionEffectMap(transactions: Transaction[], accounts: Record<string, number>): Record<string, number> {
  const effects: Record<string, number> = {};
  Object.keys(accounts || {}).forEach(name => {
    effects[name] = 0;
  });

  (Array.isArray(transactions) ? transactions : []).forEach(t => {
    if (!t || !Number.isFinite(Number(t.amount)) || Number(t.amount) <= 0) return;
    const amount = finiteMoney(t.amount);
    if (t.type === 'Income' && t.account && t.account in effects) {
      effects[t.account] += amount;
    }
    if (t.type === 'Expense' && t.account && t.account in effects) {
      effects[t.account] -= amount;
    }
    if (t.type === 'Transfer') {
      if (t.from && t.from in effects) effects[t.from] -= amount;
      if (t.to && t.to in effects) effects[t.to] += amount;
    }
  });

  return effects;
}

export function recalculateBalances(state: FinanceState): FinanceState {
  const opening = { ...state.openingBalances };
  const accounts = { ...state.accounts };

  Object.keys(accounts).forEach(name => {
    if (!(name in opening)) opening[name] = finiteMoney(accounts[name]);
  });

  const effects = transactionEffectMap(state.transactions, accounts);
  Object.keys(accounts).forEach(name => {
    accounts[name] = finiteMoney(finiteMoney(opening[name] || 0) + (effects[name] || 0));
  });

  return {
    ...state,
    openingBalances: opening,
    accounts
  };
}

const STORAGE_KEY = 'finance_track_compose_db';

export function loadFinanceData(): FinanceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const merged: FinanceState = {
          currentYear: Number(parsed.currentYear) || 2026,
          currentMonth: Number.isInteger(parsed.currentMonth) ? parsed.currentMonth : 10,
          selectedCalendarDate: parsed.selectedCalendarDate || '2026-11-04',
          accounts: parsed.accounts || defaultFinanceState.accounts,
          openingBalances: parsed.openingBalances || parsed.accounts || defaultFinanceState.openingBalances,
          categories: parsed.categories || defaultFinanceState.categories,
          favorites: parsed.favorites || defaultFinanceState.favorites,
          transactions: parsed.transactions || defaultFinanceState.transactions
        };
        return recalculateBalances(merged);
      }
    }
  } catch (e) {
    console.warn('Failed to load local finance storage', e);
  }
  return recalculateBalances(defaultFinanceState);
}

export function saveFinanceData(state: FinanceState): void {
  try {
    const updated = recalculateBalances(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}
