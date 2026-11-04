package com.financetracker.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.SwapHoriz
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.data.model.AccountEntity
import com.financetracker.app.data.model.TransactionEntity
import com.financetracker.app.data.model.TransactionType
import com.financetracker.app.ui.components.CalendarMonthView
import com.financetracker.app.ui.theme.*
import com.financetracker.app.ui.viewmodel.FinanceUiState
import com.financetracker.app.ui.viewmodel.TransSubTab
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun TransactionsScreen(
    uiState: FinanceUiState,
    transactions: List<TransactionEntity>,
    accounts: List<AccountEntity>,
    onTabSelected: (TransSubTab) -> Unit,
    onDateSelected: (String) -> Unit,
    onDeleteTransaction: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Filter for currently selected month & year
    val monthTransactions = remember(transactions, uiState.currentYear, uiState.currentMonth) {
        transactions.filter { t ->
            val dateStr = t.date.take(10)
            val parts = dateStr.split("-")
            if (parts.size >= 2) {
                val y = parts[0].toIntOrNull()
                val m = parts[1].toIntOrNull() // 1-indexed
                y == uiState.currentYear && m == (uiState.currentMonth + 1)
            } else false
        }
    }

    // Monthly totals
    val monthIncome = remember(monthTransactions) {
        monthTransactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
    }
    val monthExpense = remember(monthTransactions) {
        monthTransactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
    }
    val monthNet = monthIncome - monthExpense

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BgMain)
    ) {
        // Sub-Tabs Header (Daily, Calendar, Monthly, Total)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(BgCard)
        ) {
            listOf(
                TransSubTab.DAILY to "Daily",
                TransSubTab.CALENDAR to "Calendar",
                TransSubTab.MONTHLY to "Monthly",
                TransSubTab.TOTAL to "Total"
            ).forEach { (tab, title) ->
                val isSelected = uiState.activeTransTab == tab
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clickable { onTabSelected(tab) }
                        .padding(vertical = 10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = title,
                        color = if (isSelected) AccentRed else TextMuted,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.SemiBold else FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.6f)
                            .height(2.dp)
                            .background(if (isSelected) AccentRed else Color.Transparent)
                    )
                }
            }
        }

        // Summary Bar: Income / Expenses / Total Net
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceDark)
                .padding(vertical = 8.dp, horizontal = 12.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text("INCOME", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                Text(
                    text = "₹ %.2f".format(Locale.US, monthIncome),
                    color = AccentBlue,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text("EXPENSES", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                Text(
                    text = "₹ %.2f".format(Locale.US, monthExpense),
                    color = AccentRed,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text("TOTAL NET", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                Text(
                    text = "₹ %.2f".format(Locale.US, monthNet),
                    color = TextMain,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        HorizontalDivider(color = BorderColor)

        // Subtab Content
        when (uiState.activeTransTab) {
            TransSubTab.DAILY -> {
                DailyTabContent(
                    monthTransactions = monthTransactions,
                    onDelete = onDeleteTransaction
                )
            }
            TransSubTab.CALENDAR -> {
                CalendarTabContent(
                    uiState = uiState,
                    transactions = monthTransactions,
                    allTransactions = transactions,
                    onDateSelected = onDateSelected,
                    onDelete = onDeleteTransaction
                )
            }
            TransSubTab.MONTHLY -> {
                MonthlyTabContent(monthTransactions = monthTransactions)
            }
            TransSubTab.TOTAL -> {
                TotalTabContent(
                    allTransactions = transactions,
                    accounts = accounts
                )
            }
        }
    }
}

@Composable
private fun DailyTabContent(
    monthTransactions: List<TransactionEntity>,
    onDelete: (String) -> Unit
) {
    if (monthTransactions.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("No transactions recorded for this month.", color = TextMuted, fontSize = 13.sp)
        }
        return
    }

    // Group transactions by date string
    val grouped = remember(monthTransactions) {
        monthTransactions.groupBy { it.date.take(10) }
            .toSortedMap(compareByDescending { it })
    }

    LazyColumn(modifier = Modifier.fillMaxSize()) {
        grouped.forEach { (dateKey, list) ->
            // Date Header
            item(key = "header_$dateKey") {
                val date = try { LocalDate.parse(dateKey) } catch (e: Exception) { null }
                val dayNum = date?.dayOfMonth?.toString() ?: ""
                val dayName = date?.dayOfWeek?.name?.take(3)?.lowercase()
                    ?.replaceFirstChar { it.uppercase() } ?: ""

                val dayInc = list.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
                val dayExp = list.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SurfaceDark)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(dayNum, color = Color.White, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.width(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(BorderColor)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(dayName, color = TextMain, fontSize = 10.sp)
                        }
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        if (dayInc > 0) {
                            Text("+₹ %.2f".format(Locale.US, dayInc), color = AccentBlue, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                        if (dayExp > 0) {
                            Text("-₹ %.2f".format(Locale.US, dayExp), color = AccentRed, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }

            // Items for this day
            items(list, key = { it.id }) { item ->
                TransactionRow(item = item, onDelete = { onDelete(item.id) })
                HorizontalDivider(color = BorderColor.copy(alpha = 0.5f))
            }
        }
    }
}

@Composable
fun TransactionRow(
    item: TransactionEntity,
    onDelete: () -> Unit
) {
    var showConfirmDelete by remember { mutableStateOf(false) }

    if (showConfirmDelete) {
        AlertDialog(
            onDismissRequest = { showConfirmDelete = false },
            title = { Text("Delete Transaction?", color = TextMain, fontSize = 16.sp) },
            text = { Text("Account balances will be automatically recalculated.", color = TextMuted, fontSize = 13.sp) },
            confirmButton = {
                TextButton(onClick = {
                    showConfirmDelete = false
                    onDelete()
                }) {
                    Text("Delete", color = AccentRed, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showConfirmDelete = false }) {
                    Text("Cancel", color = TextMuted)
                }
            },
            containerColor = BgCard
        )
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(BgCard)
            .clickable { showConfirmDelete = true }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            val iconBg = when (item.type) {
                TransactionType.INCOME -> AccentBlue.copy(alpha = 0.15f)
                TransactionType.EXPENSE -> AccentRed.copy(alpha = 0.15f)
                TransactionType.TRANSFER -> Color(0xFF6B7280).copy(alpha = 0.15f)
            }
            val iconColor = when (item.type) {
                TransactionType.INCOME -> AccentBlue
                TransactionType.EXPENSE -> AccentRed
                TransactionType.TRANSFER -> Color(0xFF9CA3AF)
            }
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(iconBg),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (item.type) {
                        TransactionType.INCOME -> Icons.Default.ArrowDownward
                        TransactionType.EXPENSE -> Icons.Default.ArrowUpward
                        TransactionType.TRANSFER -> Icons.Default.SwapHoriz
                    },
                    contentDescription = item.type.name,
                    tint = iconColor,
                    modifier = Modifier.size(16.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column {
                val title = if (item.type == TransactionType.TRANSFER) {
                    "Transfer"
                } else {
                    "${item.category ?: item.type.name}${if (!item.subCategory.isNullOrBlank()) " (${item.subCategory})" else ""}"
                }
                Text(
                    text = title,
                    color = TextMain,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                val subtitle = when (item.type) {
                    TransactionType.TRANSFER -> "${item.fromAccount} → ${item.toAccount}"
                    else -> listOfNotNull(item.note?.takeIf { it.isNotBlank() }, item.account).joinToString(" • ")
                }
                Text(
                    text = subtitle,
                    color = TextMuted,
                    fontSize = 11.sp
                )
            }
        }

        val amountColor = when (item.type) {
            TransactionType.INCOME -> AccentBlue
            TransactionType.EXPENSE -> AccentRed
            TransactionType.TRANSFER -> TextMain
        }
        val prefix = when (item.type) {
            TransactionType.EXPENSE -> "-"
            TransactionType.INCOME -> "+"
            TransactionType.TRANSFER -> ""
        }
        Text(
            text = "$prefix₹ %.2f".format(Locale.US, item.amount),
            color = amountColor,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun CalendarTabContent(
    uiState: FinanceUiState,
    transactions: List<TransactionEntity>,
    allTransactions: List<TransactionEntity>,
    onDateSelected: (String) -> Unit,
    onDelete: (String) -> Unit
) {
    val dayTransactions = remember(allTransactions, uiState.selectedCalendarDate) {
        allTransactions.filter { it.date.startsWith(uiState.selectedCalendarDate) }
    }

    Column(modifier = Modifier.fillMaxSize()) {
        CalendarMonthView(
            year = uiState.currentYear,
            month = uiState.currentMonth,
            selectedDate = uiState.selectedCalendarDate,
            transactions = transactions,
            onDateSelected = onDateSelected
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceDark)
                .padding(horizontal = 14.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Transactions on ${uiState.selectedCalendarDate}",
                color = TextMain,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        if (dayTransactions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("No records for this date.", color = TextMuted, fontSize = 12.sp)
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(dayTransactions, key = { it.id }) { item ->
                    TransactionRow(item = item, onDelete = { onDelete(item.id) })
                    HorizontalDivider(color = BorderColor.copy(alpha = 0.5f))
                }
            }
        }
    }
}

@Composable
private fun MonthlyTabContent(
    monthTransactions: List<TransactionEntity>
) {
    val expenses = monthTransactions.filter { it.type == TransactionType.EXPENSE }
    val totalExp = expenses.sumOf { it.amount }

    if (totalExp == 0.0) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Text("No expense records this month.", color = TextMuted, fontSize = 13.sp)
        }
        return
    }

    val catTotals = remember(expenses) {
        expenses.groupBy { it.category ?: "Other" }
            .mapValues { (_, list) -> list.sumOf { it.amount } }
            .toList()
            .sortedByDescending { it.second }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(catTotals) { (cat, amt) ->
            val pct = (amt / totalExp) * 100
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(BgCard)
                    .border(1.dp, BorderColor, RoundedCornerShape(10.dp))
                    .padding(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(cat, color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Text("₹ %.2f (%.1f%%)".format(Locale.US, amt, pct), color = AccentRed, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { (pct / 100f).toFloat().coerceIn(0f, 1f) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = AccentRed,
                    trackColor = BorderColor
                )
            }
        }
    }
}

@Composable
private fun TotalTabContent(
    allTransactions: List<TransactionEntity>,
    accounts: List<AccountEntity>
) {
    val totalNetWorth = accounts.sumOf { it.currentBalance }
    val allIncome = allTransactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
    val allExpense = allTransactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Net Worth Card
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(BgCard)
                    .border(1.dp, BorderColor, RoundedCornerShape(14.dp))
                    .padding(16.dp)
            ) {
                Text("Overall Net Worth", color = TextMuted, fontSize = 12.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "₹ %.2f".format(Locale.US, totalNetWorth),
                    color = Color.White,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(14.dp))
                HorizontalDivider(color = BorderColor)
                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text("Total Income All-time", color = TextMuted, fontSize = 11.sp)
                        Text("₹ %.2f".format(Locale.US, allIncome), color = AccentBlue, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                    Column {
                        Text("Total Expenses All-time", color = TextMuted, fontSize = 11.sp)
                        Text("₹ %.2f".format(Locale.US, allExpense), color = AccentRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // Account Distribution
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(BgCard)
                    .border(1.dp, BorderColor, RoundedCornerShape(14.dp))
                    .padding(16.dp)
            ) {
                Text("Account Distribution", color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(10.dp))

                accounts.forEach { acc ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(acc.name, color = TextMuted, fontSize = 13.sp)
                        Text("₹ %.2f".format(Locale.US, acc.currentBalance), color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    }
                    HorizontalDivider(color = BorderColor.copy(alpha = 0.5f))
                }
            }
        }
    }
}
