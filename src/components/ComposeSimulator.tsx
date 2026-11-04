import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Settings,
  BookOpen,
  PieChart,
  Wallet,
  MoreHorizontal,
  Plus,
  ArrowDown,
  ArrowUp,
  ArrowLeftRight,
  X,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Check,
  Calendar as CalendarIcon
} from 'lucide-react';
import { FinanceState, Transaction, TransactionType, TransSubTab, NavScreen, FavoriteTemplate } from '../types/finance';
import { recalculateBalances, finiteMoney, saveFinanceData } from '../utils/financeStore';

interface ComposeSimulatorProps {
  state: FinanceState;
  setState: React.Dispatch<React.SetStateAction<FinanceState>>;
}

export const ComposeSimulator: React.FC<ComposeSimulatorProps> = ({ state, setState }) => {
  // Navigation & Tabs
  const [activeNav, setActiveNav] = useState<NavScreen>('transactions');
  const [activeTransTab, setActiveTransTab] = useState<TransSubTab>('daily');

  // Modals & BottomSheets
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState<Transaction | null>(null);

  // Form State
  const [formType, setFormType] = useState<TransactionType>('Expense');
  const [formAmountStr, setFormAmountStr] = useState('0');
  const [formCategory, setFormCategory] = useState('Food');
  const [formSubCategory, setFormSubCategory] = useState('Groceries');
  const [formAccount, setFormAccount] = useState('Cash');
  const [formTransferFrom, setFormTransferFrom] = useState('Cash');
  const [formTransferTo, setFormTransferTo] = useState('Card');
  const [formNote, setFormNote] = useState('');
  const [formDateTime, setFormDateTime] = useState('2026-11-04T12:00');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Managers form state
  const [newCatType, setNewCatType] = useState<'Expense' | 'Income'>('Expense');
  const [newCatMain, setNewCatMain] = useState('');
  const [newCatSub, setNewCatSub] = useState('');
  const [newAccName, setNewAccName] = useState('');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Month navigation
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthDisplay = `${monthNames[state.currentMonth]} ${state.currentYear}`;

  const changeMonth = (delta: number) => {
    setState(prev => {
      let m = prev.currentMonth + delta;
      let y = prev.currentYear;
      if (m < 0) {
        m = 11;
        y -= 1;
      } else if (m > 11) {
        m = 0;
        y += 1;
      }
      const next = { ...prev, currentMonth: m, currentYear: y };
      saveFinanceData(next);
      return next;
    });
  };

  // Filtered month transactions
  const monthTransactions = useMemo(() => {
    return state.transactions.filter(t => {
      const parts = t.date.slice(0, 10).split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed
        return y === state.currentYear && m === state.currentMonth;
      }
      return false;
    });
  }, [state.transactions, state.currentYear, state.currentMonth]);

  // Monthly summary
  const monthIncome = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthExpense = useMemo(() => {
    return monthTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthNet = monthIncome - monthExpense;

  // Open Form
  const openAddForm = (type: TransactionType = 'Expense') => {
    setFormType(type);
    setFormAmountStr('0');
    setFormNote('');
    setIsCategoryPickerOpen(false);
    const now = new Date();
    const iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setFormDateTime(iso);

    const accountsList = Object.keys(state.accounts);
    if (accountsList.length > 0) {
      setFormAccount(accountsList[0]);
      setFormTransferFrom(accountsList[0]);
      setFormTransferTo(accountsList[1] || accountsList[0]);
    }
    setIsAddSheetOpen(true);
  };

  // Tactile Keypad
  const handleKeypadPress = (key: string) => {
    // Play light sound effect
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(key === 'backspace' ? 320 : 540, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio context might be restricted
    }

    setFormAmountStr(prev => {
      if (key === 'backspace') {
        return prev.length > 1 ? prev.slice(0, -1) : '0';
      }
      if (key === '.') {
        if (!prev.includes('.')) return prev + '.';
        return prev;
      }
      if (key === '00') {
        return prev === '0' ? '0' : prev + '00';
      }
      if (key === '-') {
        return prev.startsWith('-') ? prev.slice(1) : '-' + prev;
      }
      return prev === '0' ? key : prev + key;
    });
  };

  const handleFormSubmit = () => {
    const amount = finiteMoney(formAmountStr);
    if (!amount || amount <= 0) {
      showToast('Please enter an amount greater than 0');
      return;
    }

    if (formType === 'Transfer' && formTransferFrom === formTransferTo) {
      showToast('Select different From and To accounts');
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: formType,
      amount,
      date: formDateTime,
      note: formNote.trim()
    };

    if (formType === 'Transfer') {
      newTx.from = formTransferFrom;
      newTx.to = formTransferTo;
    } else {
      newTx.account = formAccount;
      newTx.category = formCategory;
      newTx.subCategory = formSubCategory;
    }

    setState(prev => {
      const updated = {
        ...prev,
        transactions: [newTx, ...prev.transactions]
      };
      const reconciled = recalculateBalances(updated);
      saveFinanceData(reconciled);
      return reconciled;
    });

    setIsAddSheetOpen(false);
    showToast(`Logged ₹${amount.toFixed(2)} ${formType}`);
  };

  const handleDeleteTransaction = (id: string) => {
    setState(prev => {
      const updated = {
        ...prev,
        transactions: prev.transactions.filter(t => t.id !== id)
      };
      const reconciled = recalculateBalances(updated);
      saveFinanceData(reconciled);
      return reconciled;
    });
    setDeleteConfirmTx(null);
    showToast('Transaction deleted & balance updated');
  };

  const handleSaveFavorite = () => {
    const amount = finiteMoney(formAmountStr);
    const fav: FavoriteTemplate = {
      id: `fav-${Date.now()}`,
      type: formType,
      category: formCategory,
      subCategory: formSubCategory,
      amount
    };
    setState(prev => {
      const next = { ...prev, favorites: [...prev.favorites, fav] };
      saveFinanceData(next);
      return next;
    });
    showToast('Saved as favorite template!');
  };

  const applyFavorite = (fav: FavoriteTemplate) => {
    setIsFavoritesOpen(false);
    openAddForm(fav.type);
    setFormCategory(fav.category);
    setFormSubCategory(fav.subCategory || '');
    setFormAmountStr(fav.amount.toString());
  };

  const deleteFavorite = (id: string) => {
    setState(prev => {
      const next = { ...prev, favorites: prev.favorites.filter(f => f.id !== id) };
      saveFinanceData(next);
      return next;
    });
    showToast('Favorite removed');
  };

  // Add Category
  const handleAddCategory = () => {
    if (!newCatMain.trim()) {
      showToast('Main category name required');
      return;
    }
    setState(prev => {
      const cats = { ...prev.categories };
      const currentList = { ...cats[newCatType] };
      if (!currentList[newCatMain.trim()]) {
        currentList[newCatMain.trim()] = [];
      }
      if (newCatSub.trim() && !currentList[newCatMain.trim()].includes(newCatSub.trim())) {
        currentList[newCatMain.trim()] = [...currentList[newCatMain.trim()], newCatSub.trim()];
      }
      cats[newCatType] = currentList;
      const next = { ...prev, categories: cats };
      saveFinanceData(next);
      return next;
    });
    setNewCatMain('');
    setNewCatSub('');
    showToast('Category saved');
  };

  // Add / Edit Account
  const handleAddAccount = () => {
    if (!newAccName.trim()) {
      showToast('Account name required');
      return;
    }
    const bal = finiteMoney(newAccBalance);
    setState(prev => {
      const opening = { ...prev.openingBalances, [newAccName.trim()]: bal };
      const accounts = { ...prev.accounts, [newAccName.trim()]: bal };
      const next = recalculateBalances({ ...prev, openingBalances: opening, accounts });
      saveFinanceData(next);
      return next;
    });
    setNewAccName('');
    setNewAccBalance('');
    showToast(`Account "${newAccName.trim()}" saved`);
  };

  // Backup & Restore
  const handleExportJSON = () => {
    const backup = {
      app: 'Personal Finance Tracker (Compose Native)',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: state
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('JSON backup exported!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const data = parsed.data || parsed;
        if (data.accounts && data.transactions) {
          const next = recalculateBalances({
            ...state,
            accounts: data.accounts,
            openingBalances: data.openingBalances || data.accounts,
            categories: data.categories || state.categories,
            favorites: data.favorites || [],
            transactions: data.transactions || []
          });
          setState(next);
          saveFinanceData(next);
          showToast(`Imported ${data.transactions.length} transactions!`);
        } else {
          showToast('Invalid backup JSON format');
        }
      } catch {
        showToast('Error reading backup file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    if (window.confirm('Reset all local financial data to default?')) {
      localStorage.removeItem('finance_track_compose_db');
      window.location.reload();
    }
  };

  // Grouped transactions for Daily tab
  const groupedDaily = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    monthTransactions.forEach(t => {
      const d = t.date.slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(t);
    });
    return Object.keys(map).sort().reverse().map(d => ({
      date: d,
      items: map[d],
      income: map[d].filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
      expense: map[d].filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)
    }));
  }, [monthTransactions]);

  // Calendar calculations
  const calendarData = useMemo(() => {
    const year = state.currentYear;
    const month = state.currentMonth;
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    // Daily net
    const netMap: Record<string, number> = {};
    monthTransactions.forEach(t => {
      const d = t.date.slice(0, 10);
      if (!netMap[d]) netMap[d] = 0;
      if (t.type === 'Income') netMap[d] += t.amount;
      if (t.type === 'Expense') netMap[d] -= t.amount;
    });

    const cells: Array<{
      day: number;
      dateStr: string;
      isCurrentMonth: boolean;
      net?: number;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const todayStr = new Date().toISOString().slice(0, 10);

    // Prev month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrev - i,
        dateStr: '',
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push({
        day: d,
        dateStr,
        isCurrentMonth: true,
        net: netMap[dateStr],
        isToday: dateStr === todayStr,
        isSelected: state.selectedCalendarDate === dateStr
      });
    }

    // Remainder padding to round to multiples of 7
    const remainder = 7 - (cells.length % 7);
    if (remainder < 7) {
      for (let i = 1; i <= remainder; i++) {
        cells.push({
          day: i,
          dateStr: '',
          isCurrentMonth: false,
          isToday: false,
          isSelected: false
        });
      }
    }

    return cells;
  }, [state.currentYear, state.currentMonth, monthTransactions, state.selectedCalendarDate]);

  // Calendar selected day transactions
  const selectedDayTransactions = useMemo(() => {
    return state.transactions.filter(t => t.date.startsWith(state.selectedCalendarDate));
  }, [state.transactions, state.selectedCalendarDate]);

  // Monthly breakdown
  const monthlyCategoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions.filter(t => t.type === 'Expense').forEach(t => {
      const c = t.category || 'Other';
      map[c] = (map[c] || 0) + t.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [monthTransactions]);

  // Total Overview
  const totalNetWorth = useMemo(() => {
    return Object.values(state.accounts).reduce((s, b) => s + b, 0);
  }, [state.accounts]);

  const allTimeIncome = useMemo(() => {
    return state.transactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0);
  }, [state.transactions]);

  const allTimeExpense = useMemo(() => {
    return state.transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0);
  }, [state.transactions]);

  return (
    <div className="relative w-full max-w-[430px] h-[860px] bg-[#121214] rounded-[44px] shadow-2xl border-[6px] border-[#2c2c2e] overflow-hidden flex flex-col font-sans select-none text-[#e5e5ea]">
      {/* Android 15 Status Bar */}
      <div className="px-6 pt-3 pb-1 flex justify-between items-center text-[12px] font-medium text-gray-400 bg-[#1c1c1e] shrink-0 z-30">
        <span className="font-semibold text-gray-200">12:30</span>
        {/* Camera Punch-Hole */}
        <div className="w-4 h-4 rounded-full bg-black border border-[#2c2c2e] mx-auto -mt-1" />
        <div className="flex items-center space-x-1.5 text-[11px]">
          <span>5G</span>
          <span>●●●</span>
          <span>98%</span>
        </div>
      </div>

      {/* Jetpack Compose TopAppBar */}
      <div className="px-4 py-2.5 flex justify-between items-center bg-[#1c1c1e] border-b border-[#2c2c2e] shrink-0 z-20">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => changeMonth(-1)}
            className="p-1.5 text-gray-400 hover:text-white rounded-full active:bg-[#2c2c2e] transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-base font-bold text-gray-100 tracking-tight">{monthDisplay}</span>
          <button
            onClick={() => changeMonth(1)}
            className="p-1.5 text-gray-400 hover:text-white rounded-full active:bg-[#2c2c2e] transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center space-x-3 text-gray-400">
          <button
            onClick={() => setIsFavoritesOpen(true)}
            className="p-1.5 text-yellow-400 hover:text-yellow-300 rounded-full active:bg-[#2c2c2e] transition-colors"
            title="Favorite Templates"
          >
            <Star className="w-4 h-4 fill-yellow-400" />
          </button>
          <button
            onClick={() => setActiveNav('more')}
            className="p-1.5 text-gray-400 hover:text-white rounded-full active:bg-[#2c2c2e] transition-colors"
            title="Settings & Management"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 1. TRANSACTIONS SCREEN */}
        {activeNav === 'transactions' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* SubTab Row (Material 3 TabRow) */}
            <div className="flex text-xs border-b border-[#2c2c2e] bg-[#1c1c1e] text-gray-400 shrink-0">
              {(['daily', 'calendar', 'monthly', 'total'] as TransSubTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTransTab(tab)}
                  className={`flex-1 py-2.5 text-center font-semibold capitalize relative transition-colors ${
                    activeTransTab === tab ? 'text-[#ff3b30]' : 'hover:text-gray-200'
                  }`}
                >
                  {tab}
                  {activeTransTab === tab && (
                    <span className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-[#ff3b30] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Income / Expense / Net Summary Bar */}
            <div className="grid grid-cols-3 gap-1 p-2.5 bg-[#141416] text-center text-xs border-b border-[#2c2c2e] shrink-0">
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-medium">Income</div>
                <div className="text-[#30b0fe] font-bold text-xs mt-0.5 tabular-nums">
                  ₹ {monthIncome.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-medium">Expenses</div>
                <div className="text-[#ff3b30] font-bold text-xs mt-0.5 tabular-nums">
                  ₹ {monthExpense.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-medium">Total Net</div>
                <div className="text-gray-200 font-bold text-xs mt-0.5 tabular-nums">
                  ₹ {monthNet.toFixed(2)}
                </div>
              </div>
            </div>

            {/* SubTab Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Daily Tab */}
              {activeTransTab === 'daily' && (
                <div>
                  {groupedDaily.length === 0 ? (
                    <div className="p-12 text-center text-xs text-gray-500">
                      No transactions recorded for {monthDisplay}.
                      <br />
                      <span className="text-gray-400 block mt-2">Tap + to add your first expense or income!</span>
                    </div>
                  ) : (
                    groupedDaily.map(group => {
                      const d = new Date(group.date + 'T00:00:00');
                      const dayNum = String(d.getDate()).padStart(2, '0');
                      const dayName = d.toLocaleString('en-US', { weekday: 'short' });
                      return (
                        <div key={group.date} className="border-b border-[#2c2c2e]">
                          {/* Date Header */}
                          <div className="px-4 py-2 bg-[#171719] text-xs text-gray-400 flex justify-between items-center border-b border-[#2c2c2e]/60">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">{dayNum}</span>
                              <span className="bg-[#2c2c2e] px-1.5 py-0.5 rounded text-gray-300 text-[10px] font-medium">
                                {dayName}
                              </span>
                            </div>
                            <div className="space-x-3 text-[11px] tabular-nums font-semibold">
                              {group.income > 0 && <span className="text-[#30b0fe]">+₹ {group.income.toFixed(2)}</span>}
                              {group.expense > 0 && <span className="text-[#ff3b30]">-₹ {group.expense.toFixed(2)}</span>}
                            </div>
                          </div>

                          {/* Items */}
                          <div className="divide-y divide-[#2c2c2e]/50">
                            {group.items.map(t => (
                              <div
                                key={t.id}
                                onClick={() => setDeleteConfirmTx(t)}
                                className="px-4 py-3 flex justify-between items-center bg-[#1c1c1e] hover:bg-[#2c2c2e] active:bg-[#343438] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                      t.type === 'Income'
                                        ? 'bg-[#30b0fe]/15 text-[#30b0fe]'
                                        : t.type === 'Expense'
                                        ? 'bg-[#ff3b30]/15 text-[#ff3b30]'
                                        : 'bg-gray-700/30 text-gray-400'
                                    }`}
                                  >
                                    {t.type === 'Income' ? (
                                      <ArrowDown className="w-4 h-4" />
                                    ) : t.type === 'Expense' ? (
                                      <ArrowUp className="w-4 h-4" />
                                    ) : (
                                      <ArrowLeftRight className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold text-gray-200">
                                      {t.type === 'Transfer' ? 'Transfer' : t.category || t.type}
                                      {t.subCategory && (
                                        <span className="text-[10px] text-gray-400 font-normal ml-1">
                                          ({t.subCategory})
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-gray-500">
                                      {t.note ? `${t.note} • ` : ''}
                                      {t.type === 'Transfer' ? `${t.from} → ${t.to}` : t.account}
                                    </div>
                                  </div>
                                </div>
                                <div
                                  className={`text-xs font-bold tabular-nums ${
                                    t.type === 'Income'
                                      ? 'text-[#30b0fe]'
                                      : t.type === 'Expense'
                                      ? 'text-[#ff3b30]'
                                      : 'text-gray-200'
                                  }`}
                                >
                                  {t.type === 'Expense' ? '-' : t.type === 'Income' ? '+' : ''}₹ {t.amount.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Calendar Tab */}
              {activeTransTab === 'calendar' && (
                <div className="flex flex-col h-full">
                  {/* Calendar 7-column grid */}
                  <div className="grid grid-cols-7 gap-[1px] bg-[#2c2c2e]">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                      <div
                        key={d}
                        className={`bg-[#1c1c1e] text-center py-1.5 text-[10px] font-semibold ${
                          i === 0 ? 'text-[#ff3b30]' : i === 6 ? 'text-[#30b0fe]' : 'text-gray-400'
                        }`}
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-[1px] bg-[#2c2c2e]">
                    {calendarData.map((cell, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cell.isCurrentMonth && cell.dateStr) {
                            setState(prev => ({ ...prev, selectedCalendarDate: cell.dateStr }));
                          }
                        }}
                        className={`min-h-[50px] p-1 flex flex-col items-center justify-start text-xs cursor-pointer transition-colors ${
                          !cell.isCurrentMonth
                            ? 'bg-[#121214] opacity-30 cursor-default'
                            : cell.isSelected
                            ? 'bg-[#ff3b30]/15 border border-[#ff3b30]'
                            : 'bg-[#121214] hover:bg-[#1a1a1d]'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 flex items-center justify-center text-[11px] rounded-full ${
                            cell.isToday ? 'bg-[#ff3b30] text-white font-bold' : 'text-gray-300'
                          }`}
                        >
                          {cell.day}
                        </span>
                        {cell.net !== undefined && cell.net !== 0 && (
                          <span
                            className={`text-[9px] font-bold mt-1 tabular-nums ${
                              cell.net > 0 ? 'text-[#30b0fe]' : 'text-[#ff3b30]'
                            }`}
                          >
                            {cell.net > 0 ? '+' : ''}
                            {Math.round(cell.net)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Day Inspection list */}
                  <div className="p-2 border-t border-[#2c2c2e] bg-[#1c1c1e] text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span>Transactions on {state.selectedCalendarDate}</span>
                    <span className="text-[10px] text-gray-500 font-normal">
                      {selectedDayTransactions.length} records
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-[#2c2c2e] bg-[#121214]">
                    {selectedDayTransactions.length === 0 ? (
                      <div className="p-6 text-center text-xs text-gray-500">No records for this date.</div>
                    ) : (
                      selectedDayTransactions.map(t => (
                        <div
                          key={t.id}
                          onClick={() => setDeleteConfirmTx(t)}
                          className="px-4 py-2.5 flex justify-between items-center hover:bg-[#1c1c1e] text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-semibold text-gray-200">
                              {t.type === 'Transfer' ? 'Transfer' : t.category || t.type}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {t.type === 'Transfer' ? `${t.from} → ${t.to}` : t.account}
                            </div>
                          </div>
                          <div
                            className={`font-bold tabular-nums ${
                              t.type === 'Income'
                                ? 'text-[#30b0fe]'
                                : t.type === 'Expense'
                                ? 'text-[#ff3b30]'
                                : 'text-gray-300'
                            }`}
                          >
                            {t.type === 'Expense' ? '-' : '+'}₹ {t.amount.toFixed(2)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Monthly Breakdown Tab */}
              {activeTransTab === 'monthly' && (
                <div className="p-4 space-y-3">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Expense Breakdown by Category
                  </div>
                  {monthlyCategoryBreakdown.length === 0 ? (
                    <div className="p-8 text-center text-xs text-gray-500">No expense records this month.</div>
                  ) : (
                    monthlyCategoryBreakdown.map(([cat, amt]) => {
                      const pct = monthExpense > 0 ? (amt / monthExpense) * 100 : 0;
                      return (
                        <div key={cat} className="bg-[#1c1c1e] p-3 rounded-xl border border-[#2c2c2e] space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-gray-200">{cat}</span>
                            <span className="text-[#ff3b30] tabular-nums">
                              ₹ {amt.toFixed(2)} ({pct.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-[#2c2c2e] h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#ff3b30] h-full rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Total Overview Tab */}
              {activeTransTab === 'total' && (
                <div className="p-4 space-y-4">
                  <div className="bg-[#1c1c1e] p-4 rounded-2xl border border-[#2c2c2e] space-y-3">
                    <div className="text-xs text-gray-400">Overall Net Worth</div>
                    <div className="text-2xl font-bold text-white tabular-nums">₹ {totalNetWorth.toFixed(2)}</div>
                    <div className="pt-3 border-t border-[#2c2c2e] grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[11px]">Total Income All-time</span>
                        <span className="text-[#30b0fe] font-bold tabular-nums">₹ {allTimeIncome.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[11px]">Total Expenses All-time</span>
                        <span className="text-[#ff3b30] font-bold tabular-nums">₹ {allTimeExpense.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#1c1c1e] p-4 rounded-2xl border border-[#2c2c2e] space-y-2.5">
                    <div className="text-xs font-semibold text-gray-300">Account Distribution</div>
                    <div className="space-y-2 text-xs divide-y divide-[#2c2c2e]/60">
                      {Object.entries(state.accounts).map(([acc, bal]) => (
                        <div key={acc} className="pt-2 flex justify-between items-center">
                          <span className="text-gray-400">{acc}</span>
                          <span className="font-bold text-gray-200 tabular-nums">₹ {bal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. STATS SCREEN */}
        {activeNav === 'stats' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            <div className="text-sm font-semibold text-gray-200">Expense Analysis by Category</div>
            {monthlyCategoryBreakdown.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-500">No expense stats available for this month.</div>
            ) : (
              monthlyCategoryBreakdown.map(([cat, amt]) => {
                const pct = monthExpense > 0 ? (amt / monthExpense) * 100 : 0;
                return (
                  <div key={cat} className="bg-[#1c1c1e] p-3 rounded-xl border border-[#2c2c2e] space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-gray-200">{cat}</span>
                      <span className="font-bold text-[#ff3b30] tabular-nums">₹ {amt.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-[#2c2c2e] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#ff3b30] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(2, pct))}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500">{pct.toFixed(1)}% of total monthly expenses</div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 3. ACCOUNTS SCREEN */}
        {activeNav === 'accounts' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="grid grid-cols-3 gap-1 p-3 bg-[#141416] text-center text-xs border-b border-[#2c2c2e]">
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-medium">Assets</div>
                <div className="text-[#30b0fe] font-bold text-xs mt-0.5 tabular-nums">
                  ₹ {totalNetWorth.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-medium">Liabilities</div>
                <div className="text-[#ff3b30] font-bold text-xs mt-0.5 tabular-nums">₹ 0.00</div>
              </div>
              <div>
                <div className="text-gray-400 text-[10px] uppercase font-medium">Total</div>
                <div className="text-gray-200 font-bold text-xs mt-0.5 tabular-nums">
                  ₹ {totalNetWorth.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {Object.entries(state.accounts).map(([acc, bal]) => (
                <div
                  key={acc}
                  className="bg-[#1c1c1e] p-4 rounded-xl flex justify-between items-center border border-[#2c2c2e]"
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-200">{acc}</div>
                    {acc.toLowerCase() === 'card' && (
                      <div className="text-[10px] text-gray-500 mt-1">Balance Payable ₹ 0.00</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#30b0fe] tabular-nums">₹ {bal.toFixed(2)}</div>
                    {acc.toLowerCase() === 'card' && (
                      <div className="text-[10px] text-[#30b0fe] mt-1 tabular-nums">
                        Outst. Balance ₹ {bal.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MORE SCREEN */}
        {activeNav === 'more' && (
          <div className="flex-1 p-4 overflow-y-auto space-y-5">
            <div className="space-y-2">
              <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Management</h3>
              <div className="bg-[#1c1c1e] rounded-xl border border-[#2c2c2e] overflow-hidden divide-y divide-[#2c2c2e] text-xs">
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="w-full p-3.5 flex justify-between items-center text-left hover:bg-[#2c2c2e] transition-colors"
                >
                  <span className="font-medium text-gray-200">Category & Subcategory Settings</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setIsAccountManagerOpen(true)}
                  className="w-full p-3.5 flex justify-between items-center text-left hover:bg-[#2c2c2e] transition-colors"
                >
                  <span className="font-medium text-gray-200">Manage Accounts & Balances</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => setIsFavoritesOpen(true)}
                  className="w-full p-3.5 flex justify-between items-center text-left hover:bg-[#2c2c2e] transition-colors"
                >
                  <span className="font-medium text-gray-200">Saved Favorite Templates</span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase text-gray-400 font-semibold tracking-wider">Offline Backup & Restore</h3>
              <div className="bg-[#1c1c1e] rounded-xl border border-[#2c2c2e] overflow-hidden divide-y divide-[#2c2c2e] text-xs">
                <button
                  onClick={handleExportJSON}
                  className="w-full p-3.5 flex justify-between items-center text-left hover:bg-[#2c2c2e] text-[#30b0fe] transition-colors"
                >
                  <span className="flex items-center space-x-2 font-medium">
                    <Download className="w-4 h-4" />
                    <span>Export Backup (JSON)</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
                <label className="w-full p-3.5 flex justify-between items-center text-left hover:bg-[#2c2c2e] text-emerald-400 cursor-pointer transition-colors">
                  <span className="flex items-center space-x-2 font-medium">
                    <Upload className="w-4 h-4" />
                    <span>Import Backup (JSON)</span>
                  </span>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </label>
                <button
                  onClick={handleResetData}
                  className="w-full p-3.5 flex justify-between items-center text-left hover:bg-[#2c2c2e] text-[#ff3b30] transition-colors"
                >
                  <span className="flex items-center space-x-2 font-medium">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset All Local Data</span>
                  </span>
                </button>
              </div>
            </div>

            <div className="text-center text-[11px] text-gray-600 pt-3">
              Personal Finance Tracker (Compose Native) v1.2
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (+) */}
      {activeNav !== 'more' && (
        <button
          onClick={() => openAddForm('Expense')}
          className="absolute bottom-20 right-5 w-14 h-14 bg-[#ff3b30] rounded-full flex items-center justify-center text-white shadow-2xl z-30 active:scale-95 transition-transform"
          title="Add Transaction"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Material 3 Bottom Navigation Bar */}
      <div className="h-16 bg-[#1c1c1e] border-t border-[#2c2c2e] flex justify-around items-center shrink-0 z-20">
        <button
          onClick={() => setActiveNav('transactions')}
          className={`flex flex-col items-center text-[10px] space-y-1 ${
            activeNav === 'transactions' ? 'text-[#ff3b30] font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Trans.</span>
        </button>
        <button
          onClick={() => setActiveNav('stats')}
          className={`flex flex-col items-center text-[10px] space-y-1 ${
            activeNav === 'stats' ? 'text-[#ff3b30] font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span>Stats</span>
        </button>
        <button
          onClick={() => setActiveNav('accounts')}
          className={`flex flex-col items-center text-[10px] space-y-1 ${
            activeNav === 'accounts' ? 'text-[#ff3b30] font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span>Accounts</span>
        </button>
        <button
          onClick={() => setActiveNav('more')}
          className={`flex flex-col items-center text-[10px] space-y-1 ${
            activeNav === 'more' ? 'text-[#ff3b30] font-bold' : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>More</span>
        </button>
      </div>

      {/* Android 15 Gesture Bar */}
      <div className="h-3 bg-[#1c1c1e] flex justify-center items-center shrink-0">
        <div className="w-32 h-1 bg-gray-500 rounded-full" />
      </div>

      {/* MODAL: FAST ADD TRANSACTION BOTTOM SHEET */}
      {isAddSheetOpen && (
        <div className="absolute inset-0 bg-black/75 z-40 flex flex-col justify-end animate-fadeIn">
          <div className="bg-[#121214] rounded-t-3xl border-t border-[#2c2c2e] max-h-[92%] flex flex-col shadow-2xl">
            {/* Sheet Top Header */}
            <div className="p-3 flex items-center justify-between border-b border-[#2c2c2e] bg-[#1c1c1e] rounded-t-3xl">
              <button
                onClick={() => setIsAddSheetOpen(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-sm font-bold text-gray-200">{formType}</h2>
              <button
                onClick={handleSaveFavorite}
                className="text-yellow-400 hover:text-yellow-300 p-1"
                title="Save as Favorite"
              >
                <Star className="w-5 h-5" />
              </button>
            </div>

            {/* Income / Expense / Transfer Mode Selector */}
            <div className="p-3 bg-[#171719]">
              <div className="grid grid-cols-3 gap-2 bg-[#2c2c2e] p-1 rounded-xl text-xs text-center font-medium">
                <button
                  type="button"
                  onClick={() => setFormType('Income')}
                  className={`py-1.5 rounded-lg transition-colors ${
                    formType === 'Income' ? 'bg-[#30b0fe] text-white font-bold' : 'text-gray-400'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('Expense')}
                  className={`py-1.5 rounded-lg transition-colors ${
                    formType === 'Expense' ? 'bg-[#ff3b30] text-white font-bold' : 'text-gray-400'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('Transfer')}
                  className={`py-1.5 rounded-lg transition-colors ${
                    formType === 'Transfer' ? 'bg-gray-700 text-white font-bold' : 'text-gray-400'
                  }`}
                >
                  Transfer
                </button>
              </div>
            </div>

            {/* Scrollable Form Fields */}
            <div className="flex-1 p-4 space-y-3.5 overflow-y-auto text-xs">
              {/* Date */}
              <div className="flex justify-between items-center border-b border-[#2c2c2e] pb-2">
                <span className="text-gray-400">Date</span>
                <input
                  type="datetime-local"
                  value={formDateTime}
                  onChange={e => setFormDateTime(e.target.value)}
                  className="bg-transparent text-gray-200 font-medium focus:outline-none text-right cursor-pointer"
                />
              </div>

              {/* Amount Display */}
              <div className="flex justify-between items-center border-b border-[#2c2c2e] pb-2">
                <span className="text-gray-400">Amount</span>
                <span
                  className={`text-2xl font-bold tabular-nums ${
                    formType === 'Income'
                      ? 'text-[#30b0fe]'
                      : formType === 'Expense'
                      ? 'text-[#ff3b30]'
                      : 'text-gray-200'
                  }`}
                >
                  ₹ {finiteMoney(formAmountStr).toFixed(2)}
                </span>
              </div>

              {/* Category Picker (if not Transfer) */}
              {formType !== 'Transfer' && (
                <div className="space-y-2 border-b border-[#2c2c2e] pb-2">
                  <div
                    onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                    className="flex justify-between items-center cursor-pointer py-1"
                  >
                    <span className="text-gray-400">Category</span>
                    <span className="text-gray-200 font-semibold flex items-center space-x-1">
                      <span>{formCategory}</span>
                      <span className="text-gray-400 text-[10px]">({formSubCategory})</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1 text-gray-400" />
                    </span>
                  </div>

                  {isCategoryPickerOpen && (
                    <div className="grid grid-cols-2 gap-2 pt-2 max-h-36 overflow-y-auto">
                      {Object.entries(state.categories[formType] || {}).map(([main, subs]) =>
                        subs.map(sub => {
                          const isSelected = formCategory === main && formSubCategory === sub;
                          return (
                            <button
                              key={`${main}-${sub}`}
                              type="button"
                              onClick={() => {
                                setFormCategory(main);
                                setFormSubCategory(sub);
                                setIsCategoryPickerOpen(false);
                              }}
                              className={`p-2 rounded-xl text-left border transition-colors ${
                                isSelected
                                  ? 'bg-[#2c2c2e] border-[#ff3b30] text-white'
                                  : 'bg-[#1c1c1e] border-[#2c2c2e] text-gray-300 hover:border-gray-500'
                              }`}
                            >
                              <div className="font-semibold text-xs">{main}</div>
                              <div className="text-[10px] text-gray-400">{sub}</div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Single Account Selector (if not Transfer) */}
              {formType !== 'Transfer' && (
                <div className="flex justify-between items-center border-b border-[#2c2c2e] pb-2">
                  <span className="text-gray-400">Account</span>
                  <select
                    value={formAccount}
                    onChange={e => setFormAccount(e.target.value)}
                    className="bg-[#1c1c1e] text-gray-200 font-medium px-2 py-1 rounded border border-[#2c2c2e] focus:outline-none"
                  >
                    {Object.keys(state.accounts).map(acc => (
                      <option key={acc} value={acc} className="bg-[#1c1c1e]">
                        {acc}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Transfer From / To */}
              {formType === 'Transfer' && (
                <div className="space-y-2 border-b border-[#2c2c2e] pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">From</span>
                    <select
                      value={formTransferFrom}
                      onChange={e => setFormTransferFrom(e.target.value)}
                      className="bg-[#1c1c1e] text-gray-200 font-medium px-2 py-1 rounded border border-[#2c2c2e]"
                    >
                      {Object.keys(state.accounts).map(acc => (
                        <option key={acc} value={acc}>
                          {acc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">To</span>
                    <select
                      value={formTransferTo}
                      onChange={e => setFormTransferTo(e.target.value)}
                      className="bg-[#1c1c1e] text-gray-200 font-medium px-2 py-1 rounded border border-[#2c2c2e]"
                    >
                      {Object.keys(state.accounts).map(acc => (
                        <option key={acc} value={acc}>
                          {acc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="flex justify-between items-center border-b border-[#2c2c2e] pb-2">
                <span className="text-gray-400">Note</span>
                <input
                  type="text"
                  placeholder="Write a note..."
                  value={formNote}
                  onChange={e => setFormNote(e.target.value)}
                  className="bg-transparent text-right text-gray-200 placeholder-gray-600 focus:outline-none w-2/3"
                />
              </div>
            </div>

            {/* Custom 4-Column Tactile Numeric Keypad */}
            <div className="bg-[#1c1c1e] shrink-0">
              <div className="px-4 py-1.5 text-[11px] text-gray-400 bg-[#141416] flex justify-between items-center border-t border-[#2c2c2e]">
                <span>Tactile Input</span>
                <button
                  type="button"
                  onClick={() => setFormAmountStr('0')}
                  className="text-gray-400 hover:text-white font-medium"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-4 gap-[1px] bg-[#2c2c2e]">
                {/* Row 1 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('1')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('2')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('3')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  3
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('backspace')}
                  className="h-12 bg-[#1c1c1e] text-gray-300 active:bg-[#323236] flex items-center justify-center"
                >
                  ⌫
                </button>

                {/* Row 2 */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('4')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  4
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('5')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  5
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('6')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  6
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('-')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  -
                </button>

                {/* Row 3 & 4 with Spanning Done Key */}
                <button
                  type="button"
                  onClick={() => handleKeypadPress('7')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  7
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('8')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  8
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('9')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  9
                </button>
                {/* Spanning Done Button */}
                <button
                  type="button"
                  onClick={handleFormSubmit}
                  className={`row-span-2 h-[97px] flex items-center justify-center text-white text-base font-bold active:opacity-90 ${
                    formType === 'Income' ? 'bg-[#30b0fe]' : formType === 'Expense' ? 'bg-[#ff3b30]' : 'bg-gray-600'
                  }`}
                >
                  Done
                </button>

                <button
                  type="button"
                  onClick={() => handleKeypadPress('00')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  00
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('.')}
                  className="h-12 bg-[#1c1c1e] text-white text-lg font-medium active:bg-[#323236] flex items-center justify-center"
                >
                  .
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FAVORITES */}
      {isFavoritesOpen && (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-[#2c2c2e] max-h-[80%] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 flex justify-between items-center border-b border-[#2c2c2e]">
              <span className="text-sm font-bold text-gray-200">Favorite Templates</span>
              <button onClick={() => setIsFavoritesOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2.5">
              {state.favorites.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No favorite templates saved yet. Tap the ★ star icon on the add transaction screen!
                </div>
              ) : (
                state.favorites.map(fav => (
                  <div
                    key={fav.id}
                    className="bg-[#121214] p-3 rounded-xl border border-[#2c2c2e] flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="font-semibold text-gray-200">
                        {fav.type}: {fav.category} {fav.subCategory ? `(${fav.subCategory})` : ''}
                      </div>
                      <div className="text-[10px] text-gray-500">Amount: ₹ {fav.amount.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => applyFavorite(fav)}
                        className="px-2.5 py-1 bg-[#ff3b30] text-white font-semibold rounded text-[11px]"
                      >
                        Use
                      </button>
                      <button
                        onClick={() => deleteFavorite(fav.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORY MANAGER */}
      {isCategoryManagerOpen && (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-[#2c2c2e] max-h-[85%] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 flex justify-between items-center border-b border-[#2c2c2e]">
              <span className="text-sm font-bold text-gray-200">Category Settings</span>
              <button onClick={() => setIsCategoryManagerOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-[#121214] p-3 rounded-xl border border-[#2c2c2e] space-y-2">
                <div className="font-semibold text-gray-300">Add Category / Subcategory</div>
                <select
                  value={newCatType}
                  onChange={e => setNewCatType(e.target.value as 'Expense' | 'Income')}
                  className="w-full bg-[#1c1c1e] p-2 rounded border border-[#2c2c2e] text-white"
                >
                  <option value="Expense">Expense Category</option>
                  <option value="Income">Income Category</option>
                </select>
                <input
                  type="text"
                  placeholder="Main Category (e.g. Health)"
                  value={newCatMain}
                  onChange={e => setNewCatMain(e.target.value)}
                  className="w-full bg-[#1c1c1e] p-2 rounded border border-[#2c2c2e] text-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Subcategory (e.g. Pharmacy)"
                  value={newCatSub}
                  onChange={e => setNewCatSub(e.target.value)}
                  className="w-full bg-[#1c1c1e] p-2 rounded border border-[#2c2c2e] text-white focus:outline-none"
                />
                <button
                  onClick={handleAddCategory}
                  className="w-full py-2 bg-[#ff3b30] text-white font-semibold rounded-lg"
                >
                  Add Category
                </button>
              </div>

              {(['Expense', 'Income'] as const).map(type => (
                <div key={type} className="bg-[#121214] p-3 rounded-xl border border-[#2c2c2e] space-y-1.5">
                  <div className="font-bold text-gray-300 border-b border-[#2c2c2e] pb-1">
                    {type} Categories
                  </div>
                  {Object.entries(state.categories[type] || {}).map(([main, subs]) => (
                    <div key={main} className="pt-1">
                      <span className="font-semibold text-gray-200">{main}: </span>
                      <span className="text-gray-400">{(subs as string[]).join(', ')}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ACCOUNT MANAGER */}
      {isAccountManagerOpen && (
        <div className="absolute inset-0 bg-black/80 z-40 flex flex-col justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-[#2c2c2e] max-h-[80%] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-3.5 flex justify-between items-center border-b border-[#2c2c2e]">
              <span className="text-sm font-bold text-gray-200">Manage Accounts</span>
              <button onClick={() => setIsAccountManagerOpen(false)} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-3.5 text-xs">
              <div className="bg-[#121214] p-3 rounded-xl border border-[#2c2c2e] space-y-2">
                <div className="font-semibold text-gray-300">Add / Edit Account (Opening Balance)</div>
                <input
                  type="text"
                  placeholder="Account Name (e.g. Savings)"
                  value={newAccName}
                  onChange={e => setNewAccName(e.target.value)}
                  className="w-full bg-[#1c1c1e] p-2 rounded border border-[#2c2c2e] text-white focus:outline-none"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Opening Balance (e.g. 5000)"
                  value={newAccBalance}
                  onChange={e => setNewAccBalance(e.target.value)}
                  className="w-full bg-[#1c1c1e] p-2 rounded border border-[#2c2c2e] text-white focus:outline-none"
                />
                <button
                  onClick={handleAddAccount}
                  className="w-full py-2 bg-[#ff3b30] text-white font-semibold rounded-lg"
                >
                  Save Account
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="font-semibold text-gray-400">Current Balances</div>
                {Object.entries(state.accounts).map(([name, bal]) => (
                  <div
                    key={name}
                    className="bg-[#121214] p-3 rounded-xl border border-[#2c2c2e] flex justify-between items-center"
                  >
                    <span className="font-semibold text-gray-200">{name}</span>
                    <span className="text-[#30b0fe] font-bold tabular-nums">₹ {bal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmTx && (
        <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1c1e] rounded-2xl border border-[#2c2c2e] p-4 max-w-[320px] w-full space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-gray-100">Delete Transaction?</h3>
            <p className="text-xs text-gray-400">
              Account balances will be automatically recalculated based on the remaining ledger.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmTx(null)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTransaction(deleteConfirmTx.id)}
                className="px-3 py-1.5 text-xs bg-[#ff3b30] text-white font-semibold rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST MESSAGE NOTIFICATION */}
      {toastMessage && (
        <div className="absolute top-16 left-4 right-4 bg-gray-900/95 border border-[#2c2c2e] text-white text-xs px-3.5 py-2 rounded-xl shadow-xl z-50 flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
