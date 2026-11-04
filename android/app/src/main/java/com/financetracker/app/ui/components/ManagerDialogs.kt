package com.financetracker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.financetracker.app.data.model.*
import com.financetracker.app.ui.theme.*
import java.util.Locale

@Composable
fun FavoritesDialog(
    favorites: List<FavoriteTemplateEntity>,
    onDismiss: () -> Unit,
    onApply: (FavoriteTemplateEntity) -> Unit,
    onDelete: (String) -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.75f),
            shape = RoundedCornerShape(16.dp),
            color = BgMain
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BgCard)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Favorite Templates", color = TextMain, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }

                if (favorites.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No favorite templates saved yet.\nClick the ★ icon on the entry screen to add one.",
                            color = TextMuted,
                            fontSize = 12.sp,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(favorites, key = { it.id }) { fav ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(BgCard)
                                    .border(1.dp, BorderColor, RoundedCornerShape(10.dp))
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "${fav.type.name}: ${fav.category}${if (fav.subCategory.isNotBlank()) " (${fav.subCategory})" else ""}",
                                        color = TextMain,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text("Amount: ₹ %.2f".format(Locale.US, fav.amount), color = TextMuted, fontSize = 11.sp)
                                }
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Button(
                                        onClick = { onApply(fav) },
                                        colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                        modifier = Modifier.height(30.dp)
                                    ) {
                                        Text("Use", fontSize = 11.sp)
                                    }
                                    IconButton(
                                        onClick = { onDelete(fav.id) },
                                        modifier = Modifier.size(30.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = TextMuted, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryManagerDialog(
    categories: List<CategoryEntity>,
    onDismiss: () -> Unit,
    onAddCategory: (TransactionType, String, String) -> Unit
) {
    var selectedType by remember { mutableStateOf(TransactionType.EXPENSE) }
    var mainName by remember { mutableStateOf("") }
    var subName by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.85f),
            shape = RoundedCornerShape(16.dp),
            color = BgMain
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BgCard)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Manage Categories", color = TextMain, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Add Category Card
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(BgCard)
                                .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("Add Category / Subcategory", color = TextMain, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { selectedType = TransactionType.EXPENSE },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (selectedType == TransactionType.EXPENSE) AccentRed else SurfaceDark
                                    ),
                                    modifier = Modifier.weight(1f).height(34.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text("Expense", fontSize = 11.sp)
                                }
                                Button(
                                    onClick = { selectedType = TransactionType.INCOME },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (selectedType == TransactionType.INCOME) AccentBlue else SurfaceDark
                                    ),
                                    modifier = Modifier.weight(1f).height(34.dp),
                                    contentPadding = PaddingValues(0.dp)
                                ) {
                                    Text("Income", fontSize = 11.sp)
                                }
                            }

                            OutlinedTextField(
                                value = mainName,
                                onValueChange = { mainName = it },
                                placeholder = { Text("Main Category (e.g. Food)", fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = subName,
                                onValueChange = { subName = it },
                                placeholder = { Text("Subcategory (e.g. Dining Out)", fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )

                            Button(
                                onClick = {
                                    if (mainName.isNotBlank()) {
                                        onAddCategory(selectedType, mainName, subName)
                                        mainName = ""
                                        subName = ""
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                                modifier = Modifier.fillMaxWidth().height(36.dp)
                            ) {
                                Text("Add Category", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    // Existing Categories List
                    item {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            listOf(TransactionType.EXPENSE, TransactionType.INCOME).forEach { t ->
                                val list = categories.filter { it.type == t }
                                val grouped = list.groupBy { it.mainName }
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(BgCard)
                                        .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                                        .padding(12.dp)
                                ) {
                                    Text(
                                        text = "${t.name} Categories",
                                        color = if (t == TransactionType.EXPENSE) AccentRed else AccentBlue,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    grouped.forEach { (main, subs) ->
                                        Row(modifier = Modifier.padding(vertical = 3.dp)) {
                                            Text("$main: ", color = TextMain, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                            Text(subs.map { it.subName }.joinToString(", "), color = TextMuted, fontSize = 12.sp)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AccountManagerDialog(
    accounts: List<AccountEntity>,
    onDismiss: () -> Unit,
    onSaveAccount: (String, Double) -> Unit
) {
    var accountName by remember { mutableStateOf("") }
    var openingBalanceStr by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.8f),
            shape = RoundedCornerShape(16.dp),
            color = BgMain
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(BgCard)
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Manage Accounts", color = TextMain, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                    }
                }

                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(BgCard)
                                .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("Add / Edit Account (Opening Balance)", color = TextMain, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            OutlinedTextField(
                                value = accountName,
                                onValueChange = { accountName = it },
                                placeholder = { Text("Account Name (e.g. Savings)", fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            OutlinedTextField(
                                value = openingBalanceStr,
                                onValueChange = { openingBalanceStr = it },
                                placeholder = { Text("Opening Balance (e.g. 5000.00)", fontSize = 12.sp) },
                                modifier = Modifier.fillMaxWidth(),
                                singleLine = true
                            )
                            Button(
                                onClick = {
                                    if (accountName.isNotBlank()) {
                                        val bal = openingBalanceStr.toDoubleOrNull() ?: 0.0
                                        onSaveAccount(accountName, bal)
                                        accountName = ""
                                        openingBalanceStr = ""
                                    }
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = AccentRed),
                                modifier = Modifier.fillMaxWidth().height(36.dp)
                            ) {
                                Text("Save Account", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }

                    item {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(BgCard)
                                .border(1.dp, BorderColor, RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text("Current Accounts", color = TextMain, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            accounts.forEach { acc ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(acc.name, color = TextMain, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                                    Text("₹ %.2f".format(Locale.US, acc.currentBalance), color = AccentBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
