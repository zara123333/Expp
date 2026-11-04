package com.financetracker.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.data.model.TransactionEntity
import com.financetracker.app.data.model.TransactionType
import com.financetracker.app.ui.theme.*
import com.financetracker.app.ui.viewmodel.FinanceUiState
import java.util.Locale

@Composable
fun StatsScreen(
    uiState: FinanceUiState,
    transactions: List<TransactionEntity>,
    modifier: Modifier = Modifier
) {
    val monthExpenses = remember(transactions, uiState.currentYear, uiState.currentMonth) {
        transactions.filter { t ->
            val parts = t.date.take(10).split("-")
            if (parts.size >= 2) {
                val y = parts[0].toIntOrNull()
                val m = parts[1].toIntOrNull()
                y == uiState.currentYear && m == (uiState.currentMonth + 1) && t.type == TransactionType.EXPENSE
            } else false
        }
    }

    val totalExp = remember(monthExpenses) { monthExpenses.sumOf { it.amount } }

    val catBreakdown = remember(monthExpenses) {
        monthExpenses.groupBy { it.category ?: "Other" }
            .mapValues { (_, list) -> list.sumOf { it.amount } }
            .toList()
            .sortedByDescending { it.second }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BgMain)
            .padding(16.dp)
    ) {
        Text(
            text = "Expense Analysis by Category",
            color = TextMain,
            fontSize = 15.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(14.dp))

        if (totalExp == 0.0) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(32.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("No expense statistics available for this period.", color = TextMuted, fontSize = 13.sp)
            }
        } else {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(catBreakdown) { (cat, amt) ->
                    val pct = (amt / totalExp) * 100
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(BgCard)
                            .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                            .padding(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(cat, color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                            Text("₹ %.2f".format(Locale.US, amt), color = AccentRed, fontSize = 13.sp, fontWeight = FontWeight.Bold)
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
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "%.1f%% of total monthly expenses".format(Locale.US, pct),
                            color = TextMuted,
                            fontSize = 10.sp
                        )
                    }
                }
            }
        }
    }
}
