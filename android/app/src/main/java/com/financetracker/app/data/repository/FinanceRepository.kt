package com.financetracker.app.data.repository

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

    // Flow calculating dynamic accounts with reconciled balances
    val reconciledAccounts: Flow<List<AccountEntity>> = combine(
        allAccounts,
        allTransactions
    ) { accounts, transactions ->
        // Calculate ledger net effects per account
        val netEffects = mutableMapOf<String, Double>()
        accounts.forEach { netEffects[it.name] = 0.0 }

        transactions.forEach { t ->
            val amt = t.amount
            if (amt > 0) {
                when (t.type) {
                    TransactionType.INCOME -> {
                        t.account?.let { acc ->
                            netEffects[acc] = (netEffects[acc] ?: 0.0) + amt
                        }
                    }
                    TransactionType.EXPENSE -> {
                        t.account?.let { acc ->
                            netEffects[acc] = (netEffects[acc] ?: 0.0) - amt
                        }
                    }
                    TransactionType.TRANSFER -> {
                        t.fromAccount?.let { from ->
                            netEffects[from] = (netEffects[from] ?: 0.0) - amt
                        }
                        t.toAccount?.let { to ->
                            netEffects[to] = (netEffects[to] ?: 0.0) + amt
                        }
                    }
                }
            }
        }

        accounts.map { acc ->
            val current = round((acc.openingBalance + (netEffects[acc.name] ?: 0.0)) * 100) / 100.0
            acc.copy(currentBalance = current)
        }
    }

    suspend fun addTransaction(transaction: TransactionEntity) {
        transactionDao.insertTransaction(transaction)
    }

    suspend fun deleteTransaction(id: String) {
        transactionDao.deleteById(id)
    }

    suspend fun saveAccount(name: String, openingBalance: Double) {
        accountDao.insertAccount(
            AccountEntity(
                name = name,
                openingBalance = openingBalance,
                currentBalance = openingBalance
            )
        )
    }

    suspend fun addCategory(type: TransactionType, mainName: String, subName: String) {
        categoryDao.insertCategory(CategoryEntity(type, mainName, subName))
    }

    suspend fun saveFavorite(template: FavoriteTemplateEntity) {
        favoriteDao.insertFavorite(template)
    }

    suspend fun deleteFavorite(id: String) {
        favoriteDao.deleteById(id)
    }

    suspend fun resetAllData() {
        transactionDao.clearAll()
        accountDao.clearAll()
        categoryDao.clearAll()
        favoriteDao.clearAll()
        seedDefaults()
    }

    suspend fun seedDefaults() {
        // Default Accounts
        accountDao.insertAll(
            listOf(
                AccountEntity("Cash", 0.0, 0.0),
                AccountEntity("Card", 0.0, 0.0),
                AccountEntity("UPI", 0.0, 0.0)
            )
        )

        // Default Categories
        val defaultCategories = listOf(
            CategoryEntity(TransactionType.EXPENSE, "Food", "Groceries"),
            CategoryEntity(TransactionType.EXPENSE, "Food", "Restaurants"),
            CategoryEntity(TransactionType.EXPENSE, "Food", "Coffee"),
            CategoryEntity(TransactionType.EXPENSE, "Transport", "Fuel"),
            CategoryEntity(TransactionType.EXPENSE, "Transport", "Taxi"),
            CategoryEntity(TransactionType.EXPENSE, "Transport", "Maintenance"),
            CategoryEntity(TransactionType.EXPENSE, "Shopping", "Clothing"),
            CategoryEntity(TransactionType.EXPENSE, "Shopping", "Electronics"),
            CategoryEntity(TransactionType.EXPENSE, "Bills", "Electricity"),
            CategoryEntity(TransactionType.EXPENSE, "Bills", "Internet"),
            CategoryEntity(TransactionType.EXPENSE, "Bills", "Rent"),
            CategoryEntity(TransactionType.INCOME, "Salary", "Main Job"),
            CategoryEntity(TransactionType.INCOME, "Salary", "Freelance"),
            CategoryEntity(TransactionType.INCOME, "Bonus", "Incentive"),
            CategoryEntity(TransactionType.INCOME, "Bonus", "Gift"),
            CategoryEntity(TransactionType.INCOME, "Petty Cash", "Allowance"),
            CategoryEntity(TransactionType.INCOME, "Petty Cash", "Reimbursement")
        )
        categoryDao.insertAll(defaultCategories)
    }
}
