import React from 'react';
import { Restaurant } from '../types';
import {
  MapPin,
  Clock,
  DollarSign,
  Phone,
  MessageSquareQuote,
  ExternalLink,
  RotateCcw,
  SlidersHorizontal,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';

interface ResultCardProps {
  restaurant: Restaurant;
  decisionMode: 'select' | 'fair_spin' | 'weighted_spin';
  respinCount: number;
  onRespin: () => void;
  onBackToFilters: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  restaurant,
  decisionMode,
  respinCount,
  onRespin,
  onBackToFilters,
}) => {
  // Construct deep link to Google Maps
  const queryTarget = `${restaurant.name} ${restaurant.address || '桃園市' + (restaurant.district || '')}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryTarget)}`;

  const modeLabel = {
    select: '自己挑選',
    fair_spin: '公平抽 (真均勻)',
    weighted_spin: '加權抽 (已加權)',
  }[decisionMode];

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--bg-card)] border-2 border-[var(--accent-border)] rounded-2xl p-6 sm:p-8 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
      {/* Top Banner / Mode indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            決策結果
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--accent-light)] text-[var(--accent-base)] border border-[var(--accent-border)]">
            {modeLabel}
          </span>
        </div>

        {respinCount > 0 && (
          <span className="text-xs text-[var(--text-muted)] font-mono">
            已重抽 {respinCount} 次
          </span>
        )}
      </div>

      {/* Main Title */}
      <div className="mb-4">
        <p className="text-sm font-medium text-[var(--accent-base)] mb-1">
          今天就吃這一家！
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {restaurant.name}
        </h1>

        {/* District & Cuisines */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {restaurant.district && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              <MapPin className="w-3.5 h-3.5 text-[var(--accent-base)]" />
              {restaurant.district}
            </span>
          )}

          {restaurant.cuisine.map((c) => (
            <span
              key={c}
              className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
            >
              {c}
            </span>
          ))}

          {/* Confidence Badge */}
          <span
            className={`text-[11px] px-2 py-0.5 rounded flex items-center gap-1 font-medium ${
              restaurant.confidence === 'high'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            完整度: {restaurant.confidence === 'high' ? '高' : restaurant.confidence === 'med' ? '中' : '無'}
          </span>
        </div>
      </div>

      {/* ⭐ 1. 必備：推薦的人說（curator_note） */}
      <div className="my-5 p-4 sm:p-5 rounded-xl bg-[var(--accent-light)] border-2 border-[var(--accent-border)] relative">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--accent-base)] mb-2 uppercase tracking-wide">
          <MessageSquareQuote className="w-4 h-4" />
          <span>原清單策展者推薦註記</span>
        </div>
        <p className="text-base sm:text-lg font-semibold text-[var(--text-primary)] leading-relaxed">
          {restaurant.curator_note && restaurant.curator_note.trim()
            ? restaurant.curator_note
            : '（清單收藏無特別文字備註）'}
        </p>
      </div>

      {/* Basic Facts: Hours, Price, Address, Phone */}
      <div className="space-y-2.5 my-5 text-sm text-[var(--text-secondary)] bg-[var(--bg-card-subtle)] p-4 rounded-xl border border-[var(--border-subtle)]">
        {restaurant.hours_raw && (
          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-[var(--text-primary)]">營業時間：</span>
              <span>{restaurant.hours_raw}</span>
            </div>
          </div>
        )}

        {restaurant.price_raw && (
          <div className="flex items-start gap-2.5">
            <DollarSign className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-[var(--text-primary)]">參考價格：</span>
              <span>{restaurant.price_raw}</span>
            </div>
          </div>
        )}

        {restaurant.address && (
          <div className="flex items-start gap-2.5">
            <Building className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-[var(--text-primary)]">地址：</span>
              <span>{restaurant.address}</span>
            </div>
          </div>
        )}

        {restaurant.phone && (
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-[var(--text-primary)]">電話：</span>
              <a href={`tel:${restaurant.phone}`} className="hover:underline text-[var(--accent-base)]">
                {restaurant.phone}
              </a>
            </div>
          </div>
        )}

        {restaurant.notes && (
          <div className="flex items-start gap-2.5 text-xs text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
            <Info className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <span>特記事項：{restaurant.notes}</span>
          </div>
        )}
      </div>

      {/* 2. 必備：事實來源清單 (sources) */}
      <div className="my-4">
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
          事實層驗證來源（無合成分數 · 無 Google 評論）
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {restaurant.sources && restaurant.sources.length > 0 ? (
            restaurant.sources.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-md bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
              >
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-[var(--text-muted)]">（來源待補）</span>
          )}
        </div>
      </div>

      {/* 3 & 4. 必備按鈕：在 Google Maps 開啟 + 再抽一次 */}
      <div className="mt-8 pt-5 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* 在 Google Maps 開啟 */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="touch-target flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--text-primary)] text-[var(--bg-card)] font-bold text-sm shadow-sm hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="w-4 h-4" />
          <span>在 Google Maps 開啟 ↗</span>
        </a>

        {/* 再抽一次 */}
        <button
          type="button"
          onClick={onRespin}
          className="touch-target flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-base)] text-white font-bold text-sm shadow-sm hover:brightness-105 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>再抽一次（換一家）</span>
        </button>
      </div>

      {/* Return to filters */}
      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={onBackToFilters}
          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-base)] hover:underline inline-flex items-center gap-1.5 py-1.5 px-3"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>回到條件篩選</span>
        </button>
      </div>
    </div>
  );
};
