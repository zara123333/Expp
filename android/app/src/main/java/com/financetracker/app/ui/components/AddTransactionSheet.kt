package com.financetracker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.data.model.AccountEntity
import com.financetracker.app.data.model.CategoryEntity
import com.financetracker.app.data.model.TransactionType
import com.financetracker.app.ui.theme.*
import com.financetracker.app.ui.viewmodel.FinanceUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTransactionSheet(
    uiState: FinanceUiState,
    categories: List<CategoryEntity>,
    accounts: List<AccountEntity>,
    onClose: () -> Unit,
    onTypeChange: (TransactionType) -> Unit,
    onKeyPress: (String) -> Unit,
    onClearAmount: () -> Unit,
    onCategorySelect: (String, String) -> Unit,
    onAccountSelect: (String) -> Unit,
    onTransferSelect: (String, String) -> Unit,
    onNoteChange: (String) -> Unit,
    onSaveFavorite: () -> Unit,
    onSubmit: () -> Unit
) {
    var showCategoryPicker by remember { mutableStateOf(false) }
    val type = uiState.formType
    val typeColor = when (type) {
        TransactionType.EXPENSE -> AccentRed
        TransactionType.INCOME -> AccentBlue
        TransactionType.TRANSFER -> Color(0xFF6B7280)
    }

    ModalBottomSheet(
        onDismissRequest = onClose,
        containerColor = BgMain,
        dragHandle = null,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.95f)
        ) {
            // Sheet Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BgCard)
                    .padding(horizontal = 12.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onClose) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Close",
                        tint = TextMain
                    )
                }
                Text(
                    text = when (type) {
                        TransactionType.EXPENSE -> "Expense"
                        TransactionType.INCOME -> "Income"
                        TransactionType.TRANSFER -> "Transfer"
                    },
                    color = TextMain,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
                IconButton(onClick = onSaveFavorite) {
                    Icon(
                        imageVector = Icons.Filled.Star,
                        contentDescription = "Save Favorite",
                        tint = AccentYellow
                    )
                }
            }

            // Mode Selector: Income / Expense / Transfer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceDark)
                    .padding(8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf(
                    TransactionType.INCOME to "Income",
                    TransactionType.EXPENSE to "Expense",
                    TransactionType.TRANSFER to "Transfer"
                ).forEach { (t, label) ->
                    val isSelected = type == t
                    val btnBg = when {
                        isSelected && t == TransactionType.INCOME -> AccentBlue
                        isSelected && t == TransactionType.EXPENSE -> AccentRed
                        isSelected -> Color(0xFF4B5563)
                        else -> Color.Transparent
                    }
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(6.dp))
                            .background(btnBg)
                            .clickable { onTypeChange(t) }
                            .padding(vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = label,
                            color = if (isSelected) Color.White else TextMuted,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Form Inputs Area
            Column(
                modifier = Modifier
                    .weight(1f)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Date Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Date", color = TextMuted, fontSize = 13.sp)
                    Text(
                        text = uiState.formDateTime.replace("T", "  "),
                        color = TextMain,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                HorizontalDivider(color = BorderColor)

                // Amount Display Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Amount", color = TextMuted, fontSize = 13.sp)
                    Text(
                        text = "₹ ${uiState.formAmountStr}",
                        color = typeColor,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                HorizontalDivider(color = BorderColor)

                // Category Selection (Hidden for Transfer)
                if (type != TransactionType.TRANSFER) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showCategoryPicker = !showCategoryPicker }
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Category", color = TextMuted, fontSize = 13.sp)
                            Text(
                                text = "${uiState.formSelectedCategory} (${uiState.formSelectedSubCategory}) ›",
                                color = TextMain,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium
                            )
                        }

                        if (showCategoryPicker) {
                            val filteredCats = categories.filter { it.type == type }
                            LazyVerticalGrid(
                                columns = GridCells.Fixed(2),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(140.dp)
                                    .padding(top = 8.dp),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(filteredCats) { cat ->
                                    val isSelected = cat.mainName == uiState.formSelectedCategory &&
                                            cat.subName == uiState.formSelectedSubCategory
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(BgCard)
                                            .border(
                                                1.dp,
                                                if (isSelected) typeColor else BorderColor,
                                                RoundedCornerShape(8.dp)
                                            )
                                            .clickable {
                                                onCategorySelect(cat.mainName, cat.subName)
                                                showCategoryPicker = false
                                            }
                                            .padding(8.dp)
                                    ) {
                                        Column {
                                            Text(
                                                text = cat.mainName,
                                                color = Color.White,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.SemiBold
                                            )
                                            Text(
                                                text = cat.subName,
                                                color = TextMuted,
                                                fontSize = 10.sp
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = BorderColor)

                    // Single Account Selector
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Account", color = TextMuted, fontSize = 13.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            accounts.forEach { acc ->
                                val isSelected = acc.name == uiState.formSelectedAccount
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSelected) AccentBlue.copy(alpha = 0.2f) else BgCard)
                                        .border(1.dp, if (isSelected) AccentBlue else BorderColor, RoundedCornerShape(6.dp))
                                        .clickable { onAccountSelect(acc.name) }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = acc.name,
                                        color = if (isSelected) AccentBlue else TextMain,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }
                    }
                } else {
                    // Transfer From & To selectors
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("From Account", color = TextMuted, fontSize = 13.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            accounts.forEach { acc ->
                                val isSelected = acc.name == uiState.formTransferFrom
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSelected) AccentRed.copy(alpha = 0.2f) else BgCard)
                                        .border(1.dp, if (isSelected) AccentRed else BorderColor, RoundedCornerShape(6.dp))
                                        .clickable { onTransferSelect(acc.name, uiState.formTransferTo) }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(acc.name, color = if (isSelected) AccentRed else TextMain, fontSize = 12.sp)
                                }
                            }
                        }
                    }

                    HorizontalDivider(color = BorderColor)

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("To Account", color = TextMuted, fontSize = 13.sp)
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            accounts.forEach { acc ->
                                val isSelected = acc.name == uiState.formTransferTo
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSelected) AccentBlue.copy(alpha = 0.2f) else BgCard)
                                        .border(1.dp, if (isSelected) AccentBlue else BorderColor, RoundedCornerShape(6.dp))
                                        .clickable { onTransferSelect(uiState.formTransferFrom, acc.name) }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(acc.name, color = if (isSelected) AccentBlue else TextMain, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }

                HorizontalDivider(color = BorderColor)

                // Note input
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Note", color = TextMuted, fontSize = 13.sp)
                    TextField(
                        value = uiState.formNote,
                        onValueChange = onNoteChange,
                        placeholder = { Text("Write a note...", color = TextSecondary, fontSize = 13.sp) },
                        colors = TextFieldDefaults.colors(
                            focusedContainerColor = Color.Transparent,
                            unfocusedContainerColor = Color.Transparent,
                            focusedTextColor = TextMain,
                            unfocusedTextColor = TextMain,
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        singleLine = true,
                        modifier = Modifier.width(200.dp)
                    )
                }
            }

            // Keypad Top Bar with Clear button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceDark)
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Numeric Input", color = TextMuted, fontSize = 11.sp)
                Text(
                    text = "Clear",
                    color = AccentRed,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onClearAmount() }
                )
            }

            // Numeric Keypad
            NumericKeypad(
                onKeyPress = onKeyPress,
                onDone = onSubmit,
                accentColor = typeColor
            )
        }
    }
}
