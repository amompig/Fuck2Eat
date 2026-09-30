import React from 'react';
import { Moon, Sun, Download } from 'lucide-react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="relative w-full h-11 shrink-0 bg-[var(--bg-card)] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between select-none z-20">
      <div className="w-16" />

      {/* 標題置中 */}
      <h1 className="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-black tracking-wider text-[var(--text-primary)]">
        等等吃啥
      </h1>

      {/* 右側：匯出原始碼 ZIP 與主題切換 */}
      <div className="flex items-center gap-1 z-10">
        <a
          href="/taoyuan-food-project.zip"
          download="taoyuan-food-project.zip"
          title="匯出專案原始碼與設計檔案 (ZIP)"
          aria-label="匯出專案原始碼與設計檔案"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-base)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
        </a>

        <button
          type="button"
          onClick={onToggleDarkMode}
          aria-label="切換深淺模式"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
