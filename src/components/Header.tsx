import React from 'react';
import { Logo } from './Logo';
import { Laptop, Smartphone, ArrowRightLeft, Globe, Moon, Sun, Download } from 'lucide-react';

export type AppViewMode = 'website' | 'desktop' | 'mobile' | 'dual';

interface HeaderProps {
  viewMode: AppViewMode;
  onSelectViewMode: (mode: AppViewMode) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onSelectViewMode,
  isDarkMode,
  onToggleDarkMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center shrink-0">
          <Logo size="sm" showText={true} />
        </div>

        {/* Zone 2: Responsive View Mode Switcher - Ultra compact on mobile so it never overflows */}
        <div className="flex items-center p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-700/60 shrink-0">
          <button
            onClick={() => onSelectViewMode('website')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'website'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden sm:inline">Official Website</span>
            <span className="sm:hidden">Web</span>
          </button>

          <button
            onClick={() => onSelectViewMode('desktop')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Laptop className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden sm:inline">Windows Client</span>
            <span className="sm:hidden">Win</span>
          </button>

          <button
            onClick={() => onSelectViewMode('mobile')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden sm:inline">Android Client</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={() => onSelectViewMode('dual')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              viewMode === 'dual'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span className="hidden md:inline">Dual P2P Mode</span>
            <span className="md:hidden">Dual</span>
          </button>
        </div>

        {/* Zone 3: Dark Mode toggle & Download Action */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 sm:p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Light / Dark mode"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <a
            href="/api/download/windows"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </header>
  );
};
