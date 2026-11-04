package com.financetracker.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

enum class TransactionType {
    @SerializedName("Income")
    INCOME,

    @SerializedName("Expense")
    EXPENSE,

    @SerializedName("Transfer")
    TRANSFER
}

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey
    val id: String,
    val type: TransactionType,
    val amount: Double,
    val date: String, // ISO-8601 string, e.g. "2026-11-04T13:45"
    val account: String? = null,
    val fromAccount: String? = null,
    val toAccount: String? = null,
    val category: String? = null,
    val subCategory: String? = null,
    val note: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "accounts")
data class AccountEntity(
    @PrimaryKey
    val name: String,
    val openingBalance: Double = 0.0,
    val currentBalance: Double = 0.0
)

@Entity(tableName = "categories", primaryKeys = ["type", "mainName", "subName"])
data class CategoryEntity(
    val type: TransactionType,
    val mainName: String,
    val subName: String
)

@Entity(tableName = "favorites")
data class FavoriteTemplateEntity(
    @PrimaryKey
    val id: String,
    val type: TransactionType,
    val category: String,
    val subCategory: String = "",
    val amount: Double = 0.0
)

data class FinanceBackup(
    val app: String = "Personal Finance Tracker",
    val version: Int = 2,
    val exportedAt: String,
    val data: FinanceBackupData
)

data class FinanceBackupData(
    val currentYear: Int,
    val currentMonth: Int,
    val selectedCalendarDate: String,
    val accounts: Map<String, Double>,
    val openingBalances: Map<String, Double>?,
    val categories: Map<String, Map<String, List<String>>>,
    val favorites: List<FavoriteTemplateEntity>,
    val transactions: List<TransactionEntity>
)
