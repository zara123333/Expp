import React, { useState } from 'react';
import { ANDROID_FILES, AndroidFile } from '../data/androidProjectFiles';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FolderTree,
  Sparkles,
  Layers,
  Cpu,
  Database,
  Palette
} from 'lucide-react';
import JSZip from 'jszip';

export const CodeExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<AndroidFile>(ANDROID_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredFiles = ANDROID_FILES.filter(
    f => activeCategory === 'all' || f.category === activeCategory
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const root = zip.folder('FinanceTracker-Android');

      // Top level files
      root?.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "FinanceTracker"
include(":app")
`
      );

      root?.file(
        'build.gradle.kts',
        `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    id("com.google.devtools.ksp") version "2.0.21-1.0.28" apply false
}
`
      );

      root?.file(
        'gradle/libs.versions.toml',
        `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.11.00"
navigationCompose = "2.8.4"
room = "2.6.1"
ksp = "2.0.21-1.0.28"
coroutines = "1.9.0"
gson = "2.11.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }
gson = { group = "com.google.code.gson", name = "gson", version.ref = "gson" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`
      );

      root?.file(
        'README.md',
        `# FinanceTracker Compose Native Android
Open this folder in Android Studio (2024.1+).
Gradle will automatically sync Compose BOM 2024.11 and Room 2.6.1.
Run on an Android device or emulator with API 26+.`
      );

      // Add all project files
      ANDROID_FILES.forEach(file => {
        root?.file(file.path, file.code);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'FinanceTracker-Compose-Android.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate zip', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#141416] text-[#e5e5ea] rounded-2xl border border-[#2c2c2e] overflow-hidden shadow-xl">
      {/* Top Banner & Exporter Action */}
      <div className="p-4 sm:p-5 bg-[#1c1c1e] border-b border-[#2c2c2e] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#ff3b30]/15 text-[#ff3b30]">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Native Android Project (Kotlin & Jetpack Compose)
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Complete production-ready project with Room SQLite, StateFlow ViewModel, and Material 3 design tokens.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white font-semibold text-xs transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{isZipping ? 'Packaging Project...' : 'Download Android Studio Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Categories Bar */}
      <div className="px-4 py-2 bg-[#171719] border-b border-[#2c2c2e] flex items-center space-x-2 overflow-x-auto text-xs">
        {[
          { id: 'all', label: 'All Files', icon: FolderTree },
          { id: 'ui', label: 'Compose UI & Screens', icon: Layers },
          { id: 'viewmodel', label: 'ViewModel & StateFlow', icon: Sparkles },
          { id: 'data', label: 'Room SQLite & Repository', icon: Database },
          { id: 'theme', label: 'Material 3 Theme', icon: Palette },
          { id: 'config', label: 'Gradle & Manifest', icon: FileCode }
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#ff3b30] text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-[#2c2c2e]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Split: File Tree & Code Viewer */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left File List */}
        <div className="w-full md:w-72 bg-[#171719] border-b md:border-b-0 md:border-r border-[#2c2c2e] overflow-y-auto max-h-52 md:max-h-full p-2 space-y-1">
          {filteredFiles.map(file => {
            const isSelected = selectedFile.path === file.path;
            return (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#2c2c2e] text-white border border-[#ff3b30]/40 font-semibold'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#1c1c1e]'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#ff3b30]' : 'text-gray-500'}`} />
                  <span className="truncate">{file.name}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 text-gray-400 shrink-0 ml-2">
                  {file.language}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Code Viewer */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#121214]">
          {/* File Header Bar */}
          <div className="px-4 py-2.5 bg-[#1c1c1e] border-b border-[#2c2c2e] flex justify-between items-center text-xs">
            <div className="flex items-center space-x-2 truncate">
              <span className="font-mono text-gray-400 truncate">{selectedFile.path}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#2c2c2e] hover:bg-[#343438] text-gray-200 transition-colors text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Description banner */}
          <div className="px-4 py-2 bg-[#171719]/80 border-b border-[#2c2c2e] text-[11px] text-gray-400">
            {selectedFile.description}
          </div>

          {/* Code Text with line numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[12px] leading-relaxed text-gray-300">
            <pre className="select-text">
              <code>
                {selectedFile.code.split('\n').map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell select-none pr-4 text-right text-gray-600 text-[11px] w-8">
                      {idx + 1}
                    </span>
                    <span className="table-cell whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Architecture Comparison Table Footer */}
      <div className="p-4 bg-[#1c1c1e] border-t border-[#2c2c2e] text-xs">
        <h4 className="font-bold text-gray-200 mb-2">Architecture Mapping: HTML/JS Prototype ➔ Kotlin Jetpack Compose</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
          <div className="bg-[#121214] p-2.5 rounded-lg border border-[#2c2c2e]">
            <span className="text-[#30b0fe] font-semibold block">1. Database Layer</span>
            <span className="text-gray-400">
              Replaces browser <code className="text-gray-300">localStorage</code> with type-safe <code className="text-gray-300">Room SQLite</code> (@Entity, @Dao, @Database) with Coroutine Flows.
            </span>
          </div>
          <div className="bg-[#121214] p-2.5 rounded-lg border border-[#2c2c2e]">
            <span className="text-[#ff3b30] font-semibold block">2. Reactive State</span>
            <span className="text-gray-400">
              Translates mutable JS objects into Kotlin <code className="text-gray-300">StateFlow</code> and declarative Compose recomposition via <code className="text-gray-300">collectAsState()</code>.
            </span>
          </div>
          <div className="bg-[#121214] p-2.5 rounded-lg border border-[#2c2c2e]">
            <span className="text-emerald-400 font-semibold block">3. Custom Components</span>
            <span className="text-gray-400">
              Numeric keypad and monthly calendar are built as pure reusable Jetpack Compose widgets with Material 3 Dark theme.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
