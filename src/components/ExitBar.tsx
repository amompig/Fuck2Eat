import React from 'react';
import { ListFilter, Dices, Sparkles, AlertCircle } from 'lucide-react';

interface ExitBarProps {
  matchedCount: number;
  onOpenList: () => void;
  onFairSpin: () => void;
  onWeightedSpin: () => void;
  onRelaxFilters: () => void;
}

export const ExitBar: React.FC<ExitBarProps> = ({
  matchedCount,
  onOpenList,
  onFairSpin,
  onWeightedSpin,
  onRelaxFilters,
}) => {
  const hasMatches = matchedCount > 0;

  return (
    <div className="sticky bottom-4 z-20 w-full max-w-2xl mx-auto px-4">
      <div className="bg-[var(--bg-elevated)] border-2 border-[var(--border-strong)] rounded-2xl p-3.5 shadow-lg backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)]">
              決策收斂池
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                hasMatches
                  ? 'bg-[var(--accent-light)] text-[var(--accent-base)] border border-[var(--accent-border)]'
                  : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              符合 {matchedCount} 間
            </span>
          </div>

          <div className="text-xs text-[var(--text-muted)] hidden sm:block">
            {hasMatches ? '條件過濾完畢，從三個出口快速結束決策' : '無符合店家'}
          </div>
        </div>

        {hasMatches ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* 出口 1: 自己挑 */}
            <button
              type="button"
              onClick={onOpenList}
              className="touch-target flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] font-medium text-sm transition-colors shadow-2xs hover:border-[var(--border-strong)]"
            >
              <ListFilter className="w-4 h-4 text-[var(--text-secondary)]" />
              <span>自己挑 ({matchedCount})</span>
            </button>

            {/* 出口 2: 公平抽 (真均勻) */}
            <button
              type="button"
              onClick={onFairSpin}
              className="touch-target flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-[var(--text-primary)] bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-card)] font-bold text-sm transition-opacity shadow-sm"
              title="合格池內每家機率真均勻 (crypto.getRandomValues)"
            >
              <Dices className="w-4 h-4" />
              <span>公平抽</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 font-mono">真均勻</span>
            </button>

            {/* 出口 3: 加權抽 (依資料完整度加權) */}
            <button
              type="button"
              onClick={onWeightedSpin}
              className="touch-target flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-light)] hover:brightness-95 text-[var(--accent-base)] font-bold text-sm transition-all shadow-2xs"
              title="非純隨機，已依策展備註豐富度與資料完整度加權"
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-base)]" />
              <span>加權抽</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--accent-base)] text-white font-mono">
                已加權
              </span>
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 py-1 px-2 text-xs">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>目前條件組合無任何符合店家，禁止捏造假資料</span>
            </div>
            <button
              type="button"
              onClick={onRelaxFilters}
              className="font-medium text-[var(--accent-base)] hover:underline"
            >
              放寬營業時段或重設預算
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
