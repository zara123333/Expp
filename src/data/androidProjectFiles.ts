export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'gradle' | 'xml' | 'markdown' | 'toml';
  description: string;
  category: 'ui' | 'viewmodel' | 'data' | 'theme' | 'config';
  code: string;
}

export const ANDROID_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/financetracker/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Android Entry point initializing Room database, Repository, ViewModel, edge-to-edge display, and MainScreen Compose content.',
    code: `package com.financetracker.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.financetracker.app.data.local.FinanceDatabase
import com.financetracker.app.data.repository.FinanceRepository
import com.financetracker.app.ui.screens.MainScreen
import com.financetracker.app.ui.theme.BgMain
import com.financetracker.app.ui.theme.FinanceTrackerTheme
import com.financetracker.app.ui.viewmodel.FinanceViewModel

class MainActivity : ComponentActivity() {

    private lateinit var viewModel: FinanceViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = FinanceDatabase.getDatabase(applicationContext)
        val repository = FinanceRepository(
            transactionDao = database.transactionDao(),
            accountDao = database.accountDao(),
            categoryDao = database.categoryDao(),
            favoriteDao = database.favoriteDao()
        )

        val factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return FinanceViewModel(repository) as T
            }
        }

        viewModel = ViewModelProvider(this, factory)[FinanceViewModel::class.java]

        setContent {
            FinanceTrackerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BgMain
                ) {
                    MainScreen(viewModel = viewModel)
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/ui/screens/MainScreen.kt',
    name: 'MainScreen.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Root Material 3 Scaffold with TopAppBar, month selector, navigation bar, floating action button, and modal bottom sheet.',
    code: `package com.financetracker.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.data.model.TransactionType
import com.financetracker.app.ui.components.*
import com.financetracker.app.ui.theme.*
import com.financetracker.app.ui.viewmodel.FinanceViewModel
import com.financetracker.app.ui.viewmodel.NavigationScreen
import java.time.Month
import java.time.format.TextStyle
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(viewModel: FinanceViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val accounts by viewModel.accounts.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val favorites by viewModel.favorites.collectAsState()

    val monthName = remember(uiState.currentMonth) {
        Month.of(uiState.currentMonth + 1).getDisplayName(TextStyle.SHORT, Locale.US)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(onClick = { viewModel.changeMonth(-1) }) {
                            Icon(Icons.Default.ChevronLeft, "Prev Month", tint = TextMuted)
                        }
                        Text("$monthName \${uiState.currentYear}", color = TextMain, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { viewModel.changeMonth(1) }) {
                            Icon(Icons.Default.ChevronRight, "Next Month", tint = TextMuted)
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.setFavoritesVisible(true) }) {
                        Icon(Icons.Default.Star, "Favorites", tint = AccentYellow)
                    }
                    IconButton(onClick = { viewModel.setNav(NavigationScreen.MORE) }) {
                        Icon(Icons.Default.Settings, "Settings", tint = TextMuted)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BgCard)
            )
        },
        floatingActionButton = {
            if (uiState.activeNav != NavigationScreen.MORE) {
                FloatingActionButton(
                    onClick = { viewModel.openAddSheet(TransactionType.EXPENSE) },
                    containerColor = AccentRed,
                    contentColor = Color.White,
                    shape = CircleShape,
                    modifier = Modifier.size(56.dp)
                ) {
                    Icon(Icons.Default.Add, "Add Transaction", modifier = Modifier.size(28.dp))
                }
            }
        },
        bottomBar = {
            NavigationBar(containerColor = BgCard, tonalElevation = 0.dp, modifier = Modifier.height(64.dp)) {
                val navItems = listOf(
                    Triple(NavigationScreen.TRANSACTIONS, Icons.AutoMirrored.Filled.MenuBook, "Trans."),
                    Triple(NavigationScreen.STATS, Icons.Default.PieChart, "Stats"),
                    Triple(NavigationScreen.ACCOUNTS, Icons.Default.AccountBalanceWallet, "Accounts"),
                    Triple(NavigationScreen.MORE, Icons.Default.MoreHoriz, "More")
                )
                navItems.forEach { (screen, icon, label) ->
                    val isSelected = uiState.activeNav == screen
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { viewModel.setNav(screen) },
                        icon = { Icon(icon, label, tint = if (isSelected) AccentRed else TextMuted) },
                        label = { Text(label, color = if (isSelected) AccentRed else TextMuted, fontSize = 10.sp) },
                        colors = NavigationBarItemDefaults.colors(indicatorColor = Color.Transparent)
                    )
                }
            }
        },
        containerColor = BgMain
    ) { innerPadding ->
        Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            when (uiState.activeNav) {
                NavigationScreen.TRANSACTIONS -> TransactionsScreen(
                    uiState = uiState,
                    transactions = transactions,
                    accounts = accounts,
                    onTabSelected = { viewModel.setTransTab(it) },
                    onDateSelected = { viewModel.selectCalendarDate(it) },
                    onDeleteTransaction = { viewModel.deleteTransaction(it) }
                )
                NavigationScreen.STATS -> StatsScreen(uiState = uiState, transactions = transactions)
                NavigationScreen.ACCOUNTS -> AccountsScreen(accounts = accounts)
                NavigationScreen.MORE -> MoreScreen(
                    onOpenCategories = { viewModel.setCategoryManagerVisible(true) },
                    onOpenAccounts = { viewModel.setAccountManagerVisible(true) },
                    onOpenFavorites = { viewModel.setFavoritesVisible(true) },
                    onExportJson = { },
                    onImportJson = { },
                    onResetData = { viewModel.resetData() }
                )
            }
        }
    }

    if (uiState.isAddSheetVisible) {
        AddTransactionSheet(
            uiState = uiState,
            categories = categories,
            accounts = accounts,
            onClose = { viewModel.closeAddSheet() },
            onTypeChange = { viewModel.setFormType(it) },
            onKeyPress = { viewModel.onKeypadPress(it) },
            onClearAmount = { viewModel.clearAmount() },
            onCategorySelect = { m, s -> viewModel.setCategory(m, s) },
            onAccountSelect = { viewModel.setAccount(it) },
            onTransferSelect = { f, t -> viewModel.setTransferAccounts(f, t) },
            onNoteChange = { viewModel.setNote(it) },
            onSaveFavorite = { viewModel.saveCurrentAsFavorite() },
            onSubmit = { viewModel.submitTransaction() }
        )
    }
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/ui/components/NumericKeypad.kt',
    name: 'NumericKeypad.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Custom 4-column tactile numeric keypad with backspace and 2-row spanning Done button.',
    code: `package com.financetracker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.ui.theme.*

@Composable
fun NumericKeypad(
    modifier: Modifier = Modifier,
    onKeyPress: (String) -> Unit,
    onDone: () -> Unit,
    accentColor: Color = AccentRed
) {
    Column(modifier = modifier.fillMaxWidth().background(BorderColor)) {
        // Row 1: 1, 2, 3, Backspace
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
            KeypadButton("1", Modifier.weight(1f)) { onKeyPress("1") }
            KeypadButton("2", Modifier.weight(1f)) { onKeyPress("2") }
            KeypadButton("3", Modifier.weight(1f)) { onKeyPress("3") }
            Box(
                modifier = Modifier.weight(1f).height(52.dp).background(BgCard).clickable { onKeyPress("backspace") },
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.AutoMirrored.Filled.Backspace, "Backspace", tint = TextMain, modifier = Modifier.size(20.dp))
            }
        }
        Spacer(modifier = Modifier.height(1.dp))

        // Row 2: 4, 5, 6, -
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
            KeypadButton("4", Modifier.weight(1f)) { onKeyPress("4") }
            KeypadButton("5", Modifier.weight(1f)) { onKeyPress("5") }
            KeypadButton("6", Modifier.weight(1f)) { onKeyPress("6") }
            KeypadButton("-", Modifier.weight(1f)) { onKeyPress("-") }
        }
        Spacer(modifier = Modifier.height(1.dp))

        // Row 3 & 4 with 2-row Done key
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
            Column(modifier = Modifier.weight(3f), verticalArrangement = Arrangement.spacedBy(1.dp)) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
                    KeypadButton("7", Modifier.weight(1f)) { onKeyPress("7") }
                    KeypadButton("8", Modifier.weight(1f)) { onKeyPress("8") }
                    KeypadButton("9", Modifier.weight(1f)) { onKeyPress("9") }
                }
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
                    KeypadButton("00", Modifier.weight(1f)) { onKeyPress("00") }
                    KeypadButton("0", Modifier.weight(1f)) { onKeyPress("0") }
                    KeypadButton(".", Modifier.weight(1f)) { onKeyPress(".") }
                }
            }

            Box(
                modifier = Modifier.weight(1f).height(105.dp).background(accentColor).clickable { onDone() },
                contentAlignment = Alignment.Center
            ) {
                Text("Done", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun KeypadButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier = modifier.height(52.dp).background(BgCard).clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(text, color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Medium)
    }
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/ui/components/CalendarMonthView.kt',
    name: 'CalendarMonthView.kt',
    language: 'kotlin',
    category: 'ui',
    description: 'Custom 7-day Compose monthly calendar with daily net indicators (+₹500 / -₹120) and date inspection.',
    code: `package com.financetracker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.data.model.TransactionEntity
import com.financetracker.app.data.model.TransactionType
import com.financetracker.app.ui.theme.*
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

@Composable
fun CalendarMonthView(
    year: Int,
    month: Int,
    selectedDate: String,
    transactions: List<TransactionEntity>,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val yearMonth = YearMonth.of(year, month + 1)
    val firstDayOfWeek = yearMonth.atDay(1).dayOfWeek.value % 7
    val daysInMonth = yearMonth.lengthOfMonth()
    val prevMonth = yearMonth.minusMonths(1)
    val daysInPrevMonth = prevMonth.lengthOfMonth()

    val dailyNetMap = mutableMapOf<String, Double>()
    transactions.forEach { t ->
        val dateKey = t.date.take(10)
        val cur = dailyNetMap[dateKey] ?: 0.0
        when (t.type) {
            TransactionType.INCOME -> dailyNetMap[dateKey] = cur + t.amount
            TransactionType.EXPENSE -> dailyNetMap[dateKey] = cur - t.amount
            TransactionType.TRANSFER -> {}
        }
    }
    val todayStr = LocalDate.now().format(DateTimeFormatter.ISO_DATE)

    Column(modifier = modifier.fillMaxWidth().background(BorderColor)) {
        Row(modifier = Modifier.fillMaxWidth().background(BgCard).padding(vertical = 6.dp)) {
            val headers = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
            headers.forEachIndexed { idx, name ->
                val c = if (idx == 0) AccentRed else if (idx == 6) AccentBlue else TextMuted
                Text(name, color = c, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f), textAlign = TextAlign.Center)
            }
        }
        Spacer(modifier = Modifier.height(1.dp))

        val totalCells = ((firstDayOfWeek + daysInMonth + 6) / 7) * 7
        val rows = totalCells / 7

        Column(verticalArrangement = Arrangement.spacedBy(1.dp)) {
            for (r in 0 until rows) {
                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(1.dp)) {
                    for (c in 0 until 7) {
                        val cellIndex = r * 7 + c
                        if (cellIndex < firstDayOfWeek) {
                            val dayNum = daysInPrevMonth - (firstDayOfWeek - 1 - cellIndex)
                            Box(modifier = Modifier.weight(1f).height(52.dp).background(BgMain), contentAlignment = Alignment.TopCenter) {
                                Text("$dayNum", color = TextMuted.copy(alpha = 0.35f), fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                            }
                        } else if (cellIndex - firstDayOfWeek < daysInMonth) {
                            val day = cellIndex - firstDayOfWeek + 1
                            val dateStr = "%04d-%02d-%02d".format(year, month + 1, day)
                            val isSelected = dateStr == selectedDate
                            val isToday = dateStr == todayStr
                            val net = dailyNetMap[dateStr]

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(52.dp)
                                    .background(if (isSelected) AccentRed.copy(alpha = 0.12f) else BgMain)
                                    .then(if (isSelected) Modifier.border(1.dp, AccentRed) else Modifier)
                                    .clickable { onDateSelected(dateStr) }
                                    .padding(vertical = 4.dp, horizontal = 2.dp),
                                contentAlignment = Alignment.TopCenter
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    if (isToday) {
                                        Box(modifier = Modifier.size(20.dp).clip(CircleShape).background(AccentRed), contentAlignment = Alignment.Center) {
                                            Text("$day", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                        }
                                    } else {
                                        Text("$day", color = TextMain, fontSize = 12.sp)
                                    }
                                    if (net != null && net != 0.0) {
                                        val isPositive = net > 0
                                        Text(
                                            text = "\${if (isPositive) "+" else ""}\${net.roundToInt()}",
                                            color = if (isPositive) AccentBlue else AccentRed,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.SemiBold,
                                            maxLines = 1,
                                            modifier = Modifier.padding(top = 2.dp)
                                        )
                                    }
                                }
                            }
                        } else {
                            val nextDay = cellIndex - firstDayOfWeek - daysInMonth + 1
                            Box(modifier = Modifier.weight(1f).height(52.dp).background(BgMain), contentAlignment = Alignment.TopCenter) {
                                Text("$nextDay", color = TextMuted.copy(alpha = 0.35f), fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/ui/viewmodel/FinanceViewModel.kt',
    name: 'FinanceViewModel.kt',
    language: 'kotlin',
    category: 'viewmodel',
    description: 'StateFlow architecture managing UI state, custom numeric buffer, date selection, and CRUD actions.',
    code: `package com.financetracker.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financetracker.app.data.model.*
import com.financetracker.app.data.repository.FinanceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

enum class TransSubTab { DAILY, CALENDAR, MONTHLY, TOTAL }
enum class NavigationScreen { TRANSACTIONS, STATS, ACCOUNTS, MORE }

data class FinanceUiState(
    val currentYear: Int = 2026,
    val currentMonth: Int = 10,
    val activeNav: NavigationScreen = NavigationScreen.TRANSACTIONS,
    val activeTransTab: TransSubTab = TransSubTab.DAILY,
    val selectedCalendarDate: String = "2026-11-04",
    val isAddSheetVisible: Boolean = false,
    val isCategoryManagerVisible: Boolean = false,
    val isAccountManagerVisible: Boolean = false,
    val isFavoritesVisible: Boolean = false,
    val formType: TransactionType = TransactionType.EXPENSE,
    val formAmountStr: String = "0",
    val formSelectedCategory: String = "Food",
    val formSelectedSubCategory: String = "Groceries",
    val formSelectedAccount: String = "Cash",
    val formTransferFrom: String = "Cash",
    val formTransferTo: String = "Card",
    val formNote: String = "",
    val formDateTime: String = ""
)

class FinanceViewModel(private val repository: FinanceRepository) : ViewModel() {
    private val _uiState = MutableStateFlow(FinanceUiState())
    val uiState: StateFlow<FinanceUiState> = _uiState.asStateFlow()

    val transactions = repository.allTransactions.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val accounts = repository.reconciledAccounts.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val categories = repository.allCategories.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    val favorites = repository.allFavorites.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"))
        _uiState.update { it.copy(formDateTime = now) }
    }

    fun changeMonth(delta: Int) {
        _uiState.update { state ->
            var newMonth = state.currentMonth + delta
            var newYear = state.currentYear
            if (newMonth < 0) { newMonth = 11; newYear -= 1 }
            else if (newMonth > 11) { newMonth = 0; newYear += 1 }
            state.copy(currentYear = newYear, currentMonth = newMonth)
        }
    }

    fun setNav(nav: NavigationScreen) = _uiState.update { it.copy(activeNav = nav) }
    fun setTransTab(tab: TransSubTab) = _uiState.update { it.copy(activeTransTab = tab) }
    fun selectCalendarDate(date: String) = _uiState.update { it.copy(selectedCalendarDate = date) }

    fun openAddSheet(type: TransactionType = TransactionType.EXPENSE) {
        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"))
        _uiState.update { it.copy(isAddSheetVisible = true, formType = type, formAmountStr = "0", formNote = "", formDateTime = now) }
    }
    fun closeAddSheet() = _uiState.update { it.copy(isAddSheetVisible = false) }
    fun setFormType(type: TransactionType) = _uiState.update { it.copy(formType = type) }

    fun onKeypadPress(key: String) {
        _uiState.update { state ->
            var cur = state.formAmountStr
            when (key) {
                "backspace" -> cur = if (cur.length > 1) cur.dropLast(1) else "0"
                "." -> if (!cur.contains(".")) cur = "$cur."
                "00" -> if (cur != "0") cur = "\${cur}00"
                else -> cur = if (cur == "0") key else "$cur$key"
            }
            state.copy(formAmountStr = cur)
        }
    }
    fun clearAmount() = _uiState.update { it.copy(formAmountStr = "0") }

    fun submitTransaction() {
        val state = _uiState.value
        val amount = state.formAmountStr.toDoubleOrNull() ?: 0.0
        if (amount <= 0) return
        viewModelScope.launch {
            val id = UUID.randomUUID().toString()
            val t = if (state.formType == TransactionType.TRANSFER) {
                TransactionEntity(id, TransactionType.TRANSFER, amount, state.formDateTime, fromAccount = state.formTransferFrom, toAccount = state.formTransferTo, note = state.formNote)
            } else {
                TransactionEntity(id, state.formType, amount, state.formDateTime, account = state.formSelectedAccount, category = state.formSelectedCategory, subCategory = state.formSelectedSubCategory, note = state.formNote)
            }
            repository.addTransaction(t)
            closeAddSheet()
        }
    }
    fun deleteTransaction(id: String) = viewModelScope.launch { repository.deleteTransaction(id) }
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/data/repository/FinanceRepository.kt',
    name: 'FinanceRepository.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Offline ledger balance reconciliation engine: Opening Balances + Ledger Flow.',
    code: `package com.financetracker.app.data.repository

import com.financetracker.app.data.local.*
import com.financetracker.app.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import kotlin.math.round

class FinanceRepository(
    private val transactionDao: TransactionDao,
    private val accountDao: AccountDao,
    private val categoryDao: CategoryDao,
    private val favoriteDao: FavoriteDao
) {
    val allTransactions: Flow<List<TransactionEntity>> = transactionDao.getAllTransactions()
    val allAccounts: Flow<List<AccountEntity>> = accountDao.getAllAccounts()
    val allCategories: Flow<List<CategoryEntity>> = categoryDao.getAllCategories()
    val allFavorites: Flow<List<FavoriteTemplateEntity>> = favoriteDao.getAllFavorites()

    // Dynamic balance reconciliation from Opening Balance + Transactions ledger
    val reconciledAccounts: Flow<List<AccountEntity>> = combine(allAccounts, allTransactions) { accounts, transactions ->
        val netEffects = mutableMapOf<String, Double>()
        accounts.forEach { netEffects[it.name] = 0.0 }

        transactions.forEach { t ->
            val amt = t.amount
            if (amt > 0) {
                when (t.type) {
                    TransactionType.INCOME -> t.account?.let { netEffects[it] = (netEffects[it] ?: 0.0) + amt }
                    TransactionType.EXPENSE -> t.account?.let { netEffects[it] = (netEffects[it] ?: 0.0) - amt }
                    TransactionType.TRANSFER -> {
                        t.fromAccount?.let { netEffects[it] = (netEffects[it] ?: 0.0) - amt }
                        t.toAccount?.let { netEffects[it] = (netEffects[it] ?: 0.0) + amt }
                    }
                }
            }
        }

        accounts.map { acc ->
            val current = round((acc.openingBalance + (netEffects[acc.name] ?: 0.0)) * 100) / 100.0
            acc.copy(currentBalance = current)
        }
    }

    suspend fun addTransaction(transaction: TransactionEntity) = transactionDao.insertTransaction(transaction)
    suspend fun deleteTransaction(id: String) = transactionDao.deleteById(id)
    suspend fun saveAccount(name: String, openingBalance: Double) =
        accountDao.insertAccount(AccountEntity(name, openingBalance, openingBalance))
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/data/local/FinanceDatabase.kt',
    name: 'FinanceDatabase.kt',
    language: 'kotlin',
    category: 'data',
    description: 'Room SQLite Database implementation with offline persistence.',
    code: `package com.financetracker.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.financetracker.app.data.model.*

@Database(
    entities = [
        TransactionEntity::class,
        AccountEntity::class,
        CategoryEntity::class,
        FavoriteTemplateEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class FinanceDatabase : RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
    abstract fun accountDao(): AccountDao
    abstract fun categoryDao(): CategoryDao
    abstract fun favoriteDao(): FavoriteDao

    companion object {
        @Volatile
        private var INSTANCE: FinanceDatabase? = null

        fun getDatabase(context: Context): FinanceDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    FinanceDatabase::class.java,
                    "personal_finance_database"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/financetracker/app/ui/theme/Theme.kt',
    name: 'Theme.kt',
    language: 'kotlin',
    category: 'theme',
    description: 'Material 3 Dark Theme matching the sleek AMOLED aesthetics.',
    code: `package com.financetracker.app.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = AccentRed,
    secondary = AccentBlue,
    tertiary = AccentGreen,
    background = BgMain,
    surface = BgCard,
    surfaceVariant = SurfaceDark,
    onPrimary = androidx.compose.ui.graphics.Color.White,
    onSecondary = androidx.compose.ui.graphics.Color.White,
    onBackground = TextMain,
    onSurface = TextMain,
    outline = BorderColor
)

@Composable
fun FinanceTrackerTheme(content: @Composable () -> Unit) {
    val colorScheme = DarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = BgMain.toArgb()
            window.navigationBarColor = BgCard.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
            WindowCompat.getInsetsController(window, view).isAppearanceLightNavigationBars = false
        }
    }
    MaterialTheme(colorScheme = colorScheme, typography = Typography, content = content)
}`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'gradle',
    category: 'config',
    description: 'Module-level build script with Jetpack Compose BOM, Room SQLite with KSP, and Material 3.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.google.devtools.ksp")
}

android {
    namespace = "com.financetracker.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.financetracker.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Room persistence
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coroutines & Serialization
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.gson)
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'config',
    description: 'Android App manifest configuration with launcher activity and edge-to-edge support.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/ic_menu_agenda"
        android:label="@string/app_name"
        android:roundIcon="@android:drawable/ic_menu_agenda"
        android:supportsRtl="true"
        android:theme="@style/Theme.FinanceTracker">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.FinanceTracker"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`
  }
];
