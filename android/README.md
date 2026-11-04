# FinanceTracker - Native Android App (Kotlin & Jetpack Compose)

A personal finance tracker built natively with **Kotlin**, **Jetpack Compose (Material 3)**, and **Room SQLite Database**.

## Key Architecture & Features

- **Modern Jetpack Compose UI**: Clean dark Material 3 theme (`#121214`) with custom typography and color schemes.
- **Offline Ledger Engine (Room SQLite)**:
  - Account balances dynamically recalculated from opening balances and transaction ledger (`Income`, `Expense`, `Transfer`).
  - Coroutine Flow-based live updates (`StateFlow`).
- **Interactive Views**:
  1. **Transactions Screen**:
     - **Daily**: Grouped by date with net income/expense tags, swipe/click to delete with balance recalculation.
     - **Calendar**: Custom Compose 7-day grid with daily net income/expense badges, day selection, and transaction inspector.
     - **Monthly**: Categorized expense breakdown with percentage progress indicators.
     - **Total**: Overall net worth card, all-time totals, and account distribution.
  2. **Stats Screen**: Visual expense analysis by category.
  3. **Accounts Screen**: Asset cards, Card liability tracking, and total balance.
  4. **More Screen**: Category and Subcategory settings, opening balance manager, JSON export/restore.
- **Custom Numeric Keypad BottomSheet**:
  - ModalBottomSheet with Income / Expense / Transfer tabs.
  - Dedicated tactile 4-column numeric keypad with `Done` and `Backspace`.
  - Favorite template shortcut (★).

## How to Open in Android Studio

1. Open **Android Studio** (2024.1+ recommended).
2. Choose **File > Open** and select the `android/` folder.
3. Allow Gradle to sync.
4. Select an Android emulator (API 26+) or connected physical device.
5. Click **Run (Shift + F10)**.

## Project Structure

```
android/
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/financetracker/app/
│       │   ├── MainActivity.kt
│       │   ├── data/
│       │   │   ├── local/ (FinanceDatabase, Daos)
│       │   │   ├── model/ (Transaction, Account, Category, Favorites)
│       │   │   └── repository/ (FinanceRepository ledger logic)
│       │   └── ui/
│       │       ├── components/ (NumericKeypad, CalendarMonthView, AddTransactionSheet, Dialogs)
│       │       ├── screens/ (MainScreen, TransactionsScreen, StatsScreen, AccountsScreen, MoreScreen)
│       │       ├── theme/ (Color, Type, Theme)
│       │       └── viewmodel/ (FinanceViewModel)
│       └── res/ (strings, colors, themes)
├── gradle/
│   └── libs.versions.toml
├── build.gradle.kts
└── settings.gradle.kts
```
