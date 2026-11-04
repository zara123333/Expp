package com.financetracker.app.ui.components

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
    month: Int, // 0-indexed: 0 = Jan, 10 = Nov
    selectedDate: String,
    transactions: List<TransactionEntity>,
    onDateSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val yearMonth = YearMonth.of(year, month + 1)
    val firstDayOfWeek = yearMonth.atDay(1).dayOfWeek.value % 7 // 0 = Sun, 1 = Mon ...
    val daysInMonth = yearMonth.lengthOfMonth()
    val prevMonth = yearMonth.minusMonths(1)
    val daysInPrevMonth = prevMonth.lengthOfMonth()

    // Calculate daily net map
    val dailyNetMap = mutableMapOf<String, Double>()
    transactions.forEach { t ->
        val dateKey = t.date.take(10)
        val current = dailyNetMap[dateKey] ?: 0.0
        when (t.type) {
            TransactionType.INCOME -> dailyNetMap[dateKey] = current + t.amount
            TransactionType.EXPENSE -> dailyNetMap[dateKey] = current - t.amount
            TransactionType.TRANSFER -> { /* Transfers don't alter net personal worth */ }
        }
    }

    val todayStr = LocalDate.now().format(DateTimeFormatter.ISO_DATE)

    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(BorderColor)
    ) {
        // Day Headers
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(BgCard)
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            val headers = listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat")
            headers.forEachIndexed { index, name ->
                val color = when (index) {
                    0 -> AccentRed
                    6 -> AccentBlue
                    else -> TextMuted
                }
                Text(
                    text = name,
                    color = color,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.weight(1f),
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(1.dp))

        // Days Grid
        val totalCells = ((firstDayOfWeek + daysInMonth + 6) / 7) * 7
        val rows = totalCells / 7

        Column(
            verticalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            for (r in 0 until rows) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(1.dp)
                ) {
                    for (c in 0 until 7) {
                        val cellIndex = r * 7 + c
                        if (cellIndex < firstDayOfWeek) {
                            // Prev month day
                            val dayNum = daysInPrevMonth - (firstDayOfWeek - 1 - cellIndex)
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(52.dp)
                                    .background(BgMain),
                                contentAlignment = Alignment.TopCenter
                            ) {
                                Text(
                                    text = "$dayNum",
                                    color = TextMuted.copy(alpha = 0.35f),
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        } else if (cellIndex - firstDayOfWeek < daysInMonth) {
                            // Current month day
                            val day = cellIndex - firstDayOfWeek + 1
                            val dateStr = "%04d-%02d-%02d".format(year, month + 1, day)
                            val isSelected = dateStr == selectedDate
                            val isToday = dateStr == todayStr
                            val net = dailyNetMap[dateStr]

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(52.dp)
                                    .background(
                                        if (isSelected) AccentRed.copy(alpha = 0.12f) else BgMain
                                    )
                                    .then(
                                        if (isSelected) Modifier.border(1.dp, AccentRed) else Modifier
                                    )
                                    .clickable { onDateSelected(dateStr) }
                                    .padding(vertical = 4.dp, horizontal = 2.dp),
                                contentAlignment = Alignment.TopCenter
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    if (isToday) {
                                        Box(
                                            modifier = Modifier
                                                .size(20.dp)
                                                .clip(CircleShape)
                                                .background(AccentRed),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "$day",
                                                color = Color.White,
                                                fontSize = 11.sp,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                    } else {
                                        Text(
                                            text = "$day",
                                            color = TextMain,
                                            fontSize = 12.sp
                                        )
                                    }

                                    if (net != null && net != 0.0) {
                                        val isPositive = net > 0
                                        Text(
                                            text = "${if (isPositive) "+" else ""}${net.roundToInt()}",
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
                            // Next month day
                            val nextDay = cellIndex - firstDayOfWeek - daysInMonth + 1
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .height(52.dp)
                                    .background(BgMain),
                                contentAlignment = Alignment.TopCenter
                            ) {
                                Text(
                                    text = "$nextDay",
                                    color = TextMuted.copy(alpha = 0.35f),
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
