package com.financetracker.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
fun MainScreen(
    viewModel: FinanceViewModel
) {
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
                            Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month", tint = TextMuted)
                        }
                        Text(
                            text = "$monthName ${uiState.currentYear}",
                            color = TextMain,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        IconButton(onClick = { viewModel.changeMonth(1) }) {
                            Icon(Icons.Default.ChevronRight, contentDescription = "Next Month", tint = TextMuted)
                        }
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.setFavoritesVisible(true) }) {
                        Icon(Icons.Default.Star, contentDescription = "Favorites", tint = AccentYellow)
                    }
                    IconButton(onClick = { viewModel.setNav(NavigationScreen.MORE) }) {
                        Icon(Icons.Default.Settings, contentDescription = "Settings", tint = TextMuted)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BgCard
                )
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
                    Icon(Icons.Default.Add, contentDescription = "Add Transaction", modifier = Modifier.size(28.dp))
                }
            }
        },
        bottomBar = {
            NavigationBar(
                containerColor = BgCard,
                tonalElevation = 0.dp,
                modifier = Modifier.height(64.dp)
            ) {
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
                        icon = {
                            Icon(
                                imageVector = icon,
                                contentDescription = label,
                                tint = if (isSelected) AccentRed else TextMuted
                            )
                        },
                        label = {
                            Text(
                                text = label,
                                color = if (isSelected) AccentRed else TextMuted,
                                fontSize = 10.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            indicatorColor = Color.Transparent
                        )
                    )
                }
            }
        },
        containerColor = BgMain
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            when (uiState.activeNav) {
                NavigationScreen.TRANSACTIONS -> {
                    TransactionsScreen(
                        uiState = uiState,
                        transactions = transactions,
                        accounts = accounts,
                        onTabSelected = { viewModel.setTransTab(it) },
                        onDateSelected = { viewModel.selectCalendarDate(it) },
                        onDeleteTransaction = { viewModel.deleteTransaction(it) }
                    )
                }
                NavigationScreen.STATS -> {
                    StatsScreen(
                        uiState = uiState,
                        transactions = transactions
                    )
                }
                NavigationScreen.ACCOUNTS -> {
                    AccountsScreen(accounts = accounts)
                }
                NavigationScreen.MORE -> {
                    MoreScreen(
                        onOpenCategories = { viewModel.setCategoryManagerVisible(true) },
                        onOpenAccounts = { viewModel.setAccountManagerVisible(true) },
                        onOpenFavorites = { viewModel.setFavoritesVisible(true) },
                        onExportJson = { /* Handled via Activity / File Provider */ },
                        onImportJson = { /* Handled via Activity / File Picker */ },
                        onResetData = { viewModel.resetData() }
                    )
                }
            }
        }
    }

    // Modal Add Transaction BottomSheet
    if (uiState.isAddSheetVisible) {
        AddTransactionSheet(
            uiState = uiState,
            categories = categories,
            accounts = accounts,
            onClose = { viewModel.closeAddSheet() },
            onTypeChange = { viewModel.setFormType(it) },
            onKeyPress = { viewModel.onKeypadPress(it) },
            onClearAmount = { viewModel.clearAmount() },
            onCategorySelect = { main, sub -> viewModel.setCategory(main, sub) },
            onAccountSelect = { viewModel.setAccount(it) },
            onTransferSelect = { from, to -> viewModel.setTransferAccounts(from, to) },
            onNoteChange = { viewModel.setNote(it) },
            onSaveFavorite = { viewModel.saveCurrentAsFavorite() },
            onSubmit = { viewModel.submitTransaction() }
        )
    }

    // Favorites Dialog
    if (uiState.isFavoritesVisible) {
        FavoritesDialog(
            favorites = favorites,
            onDismiss = { viewModel.setFavoritesVisible(false) },
            onApply = { viewModel.applyFavorite(it) },
            onDelete = { viewModel.deleteFavorite(it) }
        )
    }

    // Category Manager Dialog
    if (uiState.isCategoryManagerVisible) {
        CategoryManagerDialog(
            categories = categories,
            onDismiss = { viewModel.setCategoryManagerVisible(false) },
            onAddCategory = { type, main, sub -> viewModel.addCategory(type, main, sub) }
        )
    }

    // Account Manager Dialog
    if (uiState.isAccountManagerVisible) {
        AccountManagerDialog(
            accounts = accounts,
            onDismiss = { viewModel.setAccountManagerVisible(false) },
            onSaveAccount = { name, bal -> viewModel.saveAccount(name, bal) }
        )
    }
}
