package com.financetracker.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.FileDownload
import androidx.compose.material.icons.filled.FileUpload
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.ui.theme.*

@Composable
fun MoreScreen(
    onOpenCategories: () -> Unit,
    onOpenAccounts: () -> Unit,
    onOpenFavorites: () -> Unit,
    onExportJson: () -> Unit,
    onImportJson: () -> Unit,
    onResetData: () -> Unit,
    modifier: Modifier = Modifier
) {
    var showResetDialog by remember { mutableStateOf(false) }

    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            title = { Text("Reset All Local Data?", color = TextMain, fontSize = 16.sp) },
            text = { Text("Are you sure you want to reset all local financial data? Export a backup first if you may need it later.", color = TextMuted, fontSize = 13.sp) },
            confirmButton = {
                TextButton(onClick = {
                    showResetDialog = false
                    onResetData()
                }) {
                    Text("Reset Everything", color = AccentRed, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Cancel", color = TextMuted)
                }
            },
            containerColor = BgCard
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(BgMain)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Section: Management
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "MANAGEMENT",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.sp
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(BgCard)
                    .border(1.dp, BorderColor, RoundedCornerShape(14.dp))
            ) {
                SettingsRow(title = "Category & Subcategory Settings", onClick = onOpenCategories)
                HorizontalDivider(color = BorderColor)
                SettingsRow(title = "Manage Accounts & Balances", onClick = onOpenAccounts)
                HorizontalDivider(color = BorderColor)
                SettingsRow(title = "Saved Favorite Templates", onClick = onOpenFavorites)
            }
        }

        // Section: Offline Backup & Restore
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "OFFLINE BACKUP & RESTORE",
                color = TextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 1.sp
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(14.dp))
                    .background(BgCard)
                    .border(1.dp, BorderColor, RoundedCornerShape(14.dp))
            ) {
                SettingsRowWithIcon(
                    title = "Export Backup (JSON)",
                    titleColor = AccentBlue,
                    icon = { Icon(Icons.Default.FileDownload, contentDescription = null, tint = AccentBlue) },
                    onClick = onExportJson
                )
                HorizontalDivider(color = BorderColor)
                SettingsRowWithIcon(
                    title = "Import Backup (JSON)",
                    titleColor = AccentGreen,
                    icon = { Icon(Icons.Default.FileUpload, contentDescription = null, tint = AccentGreen) },
                    onClick = onImportJson
                )
                HorizontalDivider(color = BorderColor)
                SettingsRowWithIcon(
                    title = "Reset All Local Data",
                    titleColor = AccentRed,
                    icon = { Icon(Icons.Default.DeleteForever, contentDescription = null, tint = AccentRed) },
                    onClick = { showResetDialog = true }
                )
            }
        }

        // Footer Note
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Personal Finance Tracker (Compose Native) v1.2",
                color = TextMuted.copy(alpha = 0.5f),
                fontSize = 11.sp
            )
        }
    }
}

@Composable
private fun SettingsRow(
    title: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, color = TextMain, fontSize = 13.sp)
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = TextMuted,
            modifier = Modifier.size(14.dp)
        )
    }
}

@Composable
private fun SettingsRowWithIcon(
    title: String,
    titleColor: Color,
    icon: @Composable () -> Unit,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            icon()
            Spacer(modifier = Modifier.width(10.dp))
            Text(title, color = titleColor, fontSize = 13.sp, fontWeight = FontWeight.Medium)
        }
        Icon(
            imageVector = Icons.AutoMirrored.Filled.ArrowForward,
            contentDescription = null,
            tint = TextMuted,
            modifier = Modifier.size(14.dp)
        )
    }
}
