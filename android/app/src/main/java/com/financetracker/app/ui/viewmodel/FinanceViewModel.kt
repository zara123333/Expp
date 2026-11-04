package com.financetracker.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.financetracker.app.data.model.*
import com.financetracker.app.data.repository.FinanceRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

enum class TransSubTab {
    DAILY, CALENDAR, MONTHLY, TOTAL
}

enum class NavigationScreen {
    TRANSACTIONS, STATS, ACCOUNTS, MORE
}

data class FinanceUiState(
    val currentYear: Int = 2026,
    val currentMonth: Int = 10, // 0-indexed: 10 = November
    val activeNav: NavigationScreen = NavigationScreen.TRANSACTIONS,
    val activeTransTab: TransSubTab = TransSubTab.DAILY,
    val selectedCalendarDate: String = "2026-11-02",
    val isAddSheetVisible: Boolean = false,
    val isCategoryManagerVisible: Boolean = false,
    val isAccountManagerVisible: Boolean = false,
    val isFavoritesVisible: Boolean = false,
    // Add transaction form buffer
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

class FinanceViewModel(
    private val repository: FinanceRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(FinanceUiState())
    val uiState: StateFlow<FinanceUiState> = _uiState.asStateFlow()

    val transactions: StateFlow<List<TransactionEntity>> = repository.allTransactions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val accounts: StateFlow<List<AccountEntity>> = repository.reconciledAccounts
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val categories: StateFlow<List<CategoryEntity>> = repository.allCategories
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val favorites: StateFlow<List<FavoriteTemplateEntity>> = repository.allFavorites
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    init {
        // Init with current date
        val now = LocalDateTime.now()
        val formatted = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"))
        _uiState.update { it.copy(formDateTime = formatted) }

        viewModelScope.launch {
            // Seed defaults if empty
            repository.allAccounts.first().let { accs ->
                if (accs.isEmpty()) {
                    repository.seedDefaults()
                }
            }
        }
    }

    fun changeMonth(delta: Int) {
        _uiState.update { state ->
            var newMonth = state.currentMonth + delta
            var newYear = state.currentYear
            if (newMonth < 0) {
                newMonth = 11
                newYear -= 1
            } else if (newMonth > 11) {
                newMonth = 0
                newYear += 1
            }
            state.copy(currentYear = newYear, currentMonth = newMonth)
        }
    }

    fun setNav(nav: NavigationScreen) {
        _uiState.update { it.copy(activeNav = nav) }
    }

    fun setTransTab(tab: TransSubTab) {
        _uiState.update { it.copy(activeTransTab = tab) }
    }

    fun selectCalendarDate(dateStr: String) {
        _uiState.update { it.copy(selectedCalendarDate = dateStr) }
    }

    fun openAddSheet(type: TransactionType = TransactionType.EXPENSE) {
        val now = LocalDateTime.now()
        val formatted = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"))
        _uiState.update {
            it.copy(
                isAddSheetVisible = true,
                formType = type,
                formAmountStr = "0",
                formNote = "",
                formDateTime = formatted
            )
        }
    }

    fun closeAddSheet() {
        _uiState.update { it.copy(isAddSheetVisible = false) }
    }

    fun setFormType(type: TransactionType) {
        _uiState.update { it.copy(formType = type) }
    }

    fun onKeypadPress(key: String) {
        _uiState.update { state ->
            var current = state.formAmountStr
            when (key) {
                "backspace" -> {
                    current = if (current.length > 1) current.dropLast(1) else "0"
                }
                "." -> {
                    if (!current.contains(".")) {
                        current = "$current."
                    }
                }
                "00" -> {
                    if (current != "0") current = "${current}00"
                }
                else -> {
                    current = if (current == "0") key else "$current$key"
                }
            }
            state.copy(formAmountStr = current)
        }
    }

    fun clearAmount() {
        _uiState.update { it.copy(formAmountStr = "0") }
    }

    fun setCategory(main: String, sub: String) {
        _uiState.update { it.copy(formSelectedCategory = main, formSelectedSubCategory = sub) }
    }

    fun setAccount(account: String) {
        _uiState.update { it.copy(formSelectedAccount = account) }
    }

    fun setTransferAccounts(from: String, to: String) {
        _uiState.update { it.copy(formTransferFrom = from, formTransferTo = to) }
    }

    fun setNote(note: String) {
        _uiState.update { it.copy(formNote = note) }
    }

    fun submitTransaction() {
        val state = _uiState.value
        val amount = state.formAmountStr.toDoubleOrNull() ?: 0.0
        if (amount <= 0) return

        viewModelScope.launch {
            val id = UUID.randomUUID().toString()
            val transaction = when (state.formType) {
                TransactionType.TRANSFER -> {
                    if (state.formTransferFrom == state.formTransferTo) return@launch
                    TransactionEntity(
                        id = id,
                        type = TransactionType.TRANSFER,
                        amount = amount,
                        date = state.formDateTime,
                        fromAccount = state.formTransferFrom,
                        toAccount = state.formTransferTo,
                        note = state.formNote
                    )
                }
                else -> {
                    TransactionEntity(
                        id = id,
                        type = state.formType,
                        amount = amount,
                        date = state.formDateTime,
                        account = state.formSelectedAccount,
                        category = state.formSelectedCategory,
                        subCategory = state.formSelectedSubCategory,
                        note = state.formNote
                    )
                }
            }
            repository.addTransaction(transaction)
            closeAddSheet()
        }
    }

    fun deleteTransaction(id: String) {
        viewModelScope.launch {
            repository.deleteTransaction(id)
        }
    }

    fun saveCurrentAsFavorite() {
        val state = _uiState.value
        val amount = state.formAmountStr.toDoubleOrNull() ?: 0.0
        val favorite = FavoriteTemplateEntity(
            id = UUID.randomUUID().toString(),
            type = state.formType,
            category = state.formSelectedCategory,
            subCategory = state.formSelectedSubCategory,
            amount = amount
        )
        viewModelScope.launch {
            repository.saveFavorite(favorite)
        }
    }

    fun applyFavorite(fav: FavoriteTemplateEntity) {
        _uiState.update {
            it.copy(
                isFavoritesVisible = false,
                isAddSheetVisible = true,
                formType = fav.type,
                formSelectedCategory = fav.category,
                formSelectedSubCategory = fav.subCategory,
                formAmountStr = fav.amount.toString()
            )
        }
    }

    fun deleteFavorite(id: String) {
        viewModelScope.launch {
            repository.deleteFavorite(id)
        }
    }

    fun setCategoryManagerVisible(visible: Boolean) {
        _uiState.update { it.copy(isCategoryManagerVisible = visible) }
    }

    fun setAccountManagerVisible(visible: Boolean) {
        _uiState.update { it.copy(isAccountManagerVisible = visible) }
    }

    fun setFavoritesVisible(visible: Boolean) {
        _uiState.update { it.copy(isFavoritesVisible = visible) }
    }

    fun addCategory(type: TransactionType, main: String, sub: String) {
        if (main.isBlank()) return
        viewModelScope.launch {
            repository.addCategory(type, main.trim(), sub.trim())
        }
    }

    fun saveAccount(name: String, openingBalance: Double) {
        if (name.isBlank()) return
        viewModelScope.launch {
            repository.saveAccount(name.trim(), openingBalance)
        }
    }

    fun resetData() {
        viewModelScope.launch {
            repository.resetAllData()
        }
    }
}
