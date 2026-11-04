package com.financetracker.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Backspace
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.financetracker.app.ui.theme.*

@Composable
fun NumericKeypad(
    modifier: Modifier = Modifier,
    onKeyPress: (String) -> Unit,
    onDone: () -> Unit,
    accentColor: Color = AccentRed
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .background(BorderColor)
    ) {
        // Row 1: 1, 2, 3, Backspace
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            KeypadButton("1", Modifier.weight(1f)) { onKeyPress("1") }
            KeypadButton("2", Modifier.weight(1f)) { onKeyPress("2") }
            KeypadButton("3", Modifier.weight(1f)) { onKeyPress("3") }
            KeypadIconButton(
                modifier = Modifier.weight(1f),
                onClick = { onKeyPress("backspace") }
            ) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Backspace,
                    contentDescription = "Backspace",
                    tint = TextMain,
                    modifier = Modifier.size(20.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(1.dp))

        // Row 2: 4, 5, 6, -
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            KeypadButton("4", Modifier.weight(1f)) { onKeyPress("4") }
            KeypadButton("5", Modifier.weight(1f)) { onKeyPress("5") }
            KeypadButton("6", Modifier.weight(1f)) { onKeyPress("6") }
            KeypadButton("-", Modifier.weight(1f)) { onKeyPress("-") }
        }

        Spacer(modifier = Modifier.height(1.dp))

        // Row 3 & 4 with Spanning Done key
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(1.dp)
        ) {
            // Left 3 columns
            Column(
                modifier = Modifier.weight(3f),
                verticalArrangement = Arrangement.spacedBy(1.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(1.dp)
                ) {
                    KeypadButton("7", Modifier.weight(1f)) { onKeyPress("7") }
                    KeypadButton("8", Modifier.weight(1f)) { onKeyPress("8") }
                    KeypadButton("9", Modifier.weight(1f)) { onKeyPress("9") }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(1.dp)
                ) {
                    KeypadButton("00", Modifier.weight(1f)) { onKeyPress("00") }
                    KeypadButton("0", Modifier.weight(1f)) { onKeyPress("0") }
                    KeypadButton(".", Modifier.weight(1f)) { onKeyPress(".") }
                }
            }

            // Right column: Tall Done Button spanning 2 rows
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(105.dp)
                    .background(accentColor)
                    .clickable { onDone() },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Done",
                    color = Color.White,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun KeypadButton(
    text: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Box(
        modifier = modifier
            .height(52.dp)
            .background(BgCard)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun KeypadIconButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
    icon: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .height(52.dp)
            .background(BgCard)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        icon()
    }
}
