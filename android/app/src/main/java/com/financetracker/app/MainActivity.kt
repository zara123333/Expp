package com.financetracker.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.financetracker.app.data.local.FinanceDatabase
import com.financetracker.app.data.repository.FinanceRepository
import com.financetracker.app.ui.screens.MainScreen
import com.financetracker.app.ui.theme.BgMain
import com.financetracker.app.ui.theme.FinanceTrackerTheme
import com.financetracker.app.ui.viewmodel.FinanceViewModel

class MainActivity : ComponentActivity() {

    private lateinit var viewModel: FinanceViewModel

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val database = FinanceDatabase.getDatabase(applicationContext)
        val repository = FinanceRepository(
            transactionDao = database.transactionDao(),
            accountDao = database.accountDao(),
            categoryDao = database.categoryDao(),
            favoriteDao = database.favoriteDao()
        )

        val factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return FinanceViewModel(repository) as T
            }
        }

        viewModel = ViewModelProvider(this, factory)[FinanceViewModel::class.java]

        setContent {
            FinanceTrackerTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BgMain
                ) {
                    MainScreen(viewModel = viewModel)
                }
            }
        }
    }
}
