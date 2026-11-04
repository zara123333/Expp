import { useState } from 'react';
import { ComposeSimulator } from './components/ComposeSimulator';
import { CodeExplorer } from './components/CodeExplorer';
import { loadFinanceData } from './utils/financeStore';
import { Smartphone, Code, Columns, Download, Sparkles } from 'lucide-react';

export default function App() {
  const [financeState, setFinanceState] = useState(() => loadFinanceData());
  const [viewMode, setViewMode] = useState<'simulator' | 'code' | 'split'>('split');

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col font-sans selection:bg-[#ff3b30]/30 selection:text-white">
      {/* Top Header Bar */}
      <header className="px-4 sm:px-8 py-3.5 bg-[#141416] border-b border-[#2c2c2e] flex flex-wrap justify-between items-center gap-4 sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff3b30] to-[#ff6b60] flex items-center justify-center shadow-lg shadow-[#ff3b30]/20">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                FinanceTrack Compose
              </h1>
              <span className="bg-[#2c2c2e] text-[#30b0fe] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#30b0fe]/30">
                Kotlin & Jetpack Compose
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Converted from offline HTML/JS to Native Android with Material 3 & Room SQLite
            </p>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex items-center bg-[#1c1c1e] p-1 rounded-xl border border-[#2c2c2e]">
          <button
            onClick={() => setViewMode('simulator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'simulator'
                ? 'bg-[#ff3b30] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">App Simulator</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'code'
                ? 'bg-[#ff3b30] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Kotlin Source & Zip</span>
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'split'
                ? 'bg-[#ff3b30] text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 sm:p-6 flex flex-col items-center justify-center overflow-hidden">
        {/* Split View (Desktop) */}
        {viewMode === 'split' && (
          <div className="w-full h-full flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 xl:gap-8 max-h-[920px]">
            {/* Left: Native Android Phone Simulator */}
            <div className="shrink-0 flex flex-col items-center justify-center">
              <div className="flex items-center justify-between w-full max-w-[430px] mb-2 px-1 text-xs text-gray-400">
                <span className="font-semibold text-gray-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ff3b30]" />
                  <span>Interactive Android Emulator</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Live Compose UI
                </span>
              </div>
              <ComposeSimulator state={financeState} setState={setFinanceState} />
            </div>

            {/* Right: Code Inspector & Project Exporter */}
            <div className="flex-1 w-full min-w-0 h-[860px] flex flex-col">
              <CodeExplorer />
            </div>
          </div>
        )}

        {/* Simulator Only View */}
        {viewMode === 'simulator' && (
          <div className="w-full flex flex-col items-center justify-center py-2">
            <div className="flex items-center justify-between w-full max-w-[430px] mb-2 px-1 text-xs text-gray-400">
              <span className="font-semibold text-gray-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff3b30]" />
                <span>Interactive Jetpack Compose Preview</span>
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Offline Mode Active
              </span>
            </div>
            <ComposeSimulator state={financeState} setState={setFinanceState} />
          </div>
        )}

        {/* Code & Project Inspector Only View */}
        {viewMode === 'code' && (
          <div className="w-full h-[860px] flex flex-col">
            <CodeExplorer />
          </div>
        )}
      </main>
    </div>
  );
}
