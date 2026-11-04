package com.financetracker.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.data.model.AccountEntity
import com.financetracker.app.ui.theme.*
import java.util.Locale

@Composable
fun AccountsScreen(
    accounts: List<AccountEntity>,
    modifier: Modifier = Modifier
) {
    val totalAssets = remember(accounts) { accounts.sumOf { it.currentBalance } }
    val totalLiabilities = 0.0 // Default 0.00
    val netTotal = totalAssets - totalLiabilities

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BgMain)
    ) {
        // Summary Bar (Assets, Liabilities, Total)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(SurfaceDark)
                .padding(vertical = 12.dp, horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text("ASSETS", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(2.dp))
                Text("₹ %.2f".format(Locale.US, totalAssets), color = AccentBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text("LIABILITIES", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(2.dp))
                Text("₹ %.2f".format(Locale.US, totalLiabilities), color = AccentRed, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.weight(1f)) {
                Text("TOTAL", color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(2.dp))
                Text("₹ %.2f".format(Locale.US, netTotal), color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
        }

        HorizontalDivider(color = BorderColor)

        // Account List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(accounts, key = { it.name }) { acc ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(BgCard)
                        .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = acc.name,
                            color = TextMain,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        if (acc.name.equals("Card", ignoreCase = true)) {
                            Text(
                                text = "Balance Payable ₹ 0.00",
                                color = TextMuted,
                                fontSize = 10.sp
                            )
                        }
                    }

                    Column(horizontalAlignment = Alignment.End) {
                        Text(
                            text = "₹ %.2f".format(Locale.US, acc.currentBalance),
                            color = AccentBlue,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        if (acc.name.equals("Card", ignoreCase = true)) {
                            Text(
                                text = "Outst. Balance ₹ %.2f".format(Locale.US, acc.currentBalance),
                                color = AccentBlue.copy(alpha = 0.8f),
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
