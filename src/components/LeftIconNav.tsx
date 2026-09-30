import React, { useState, useEffect, useRef } from 'react';
import { DistrictName, FilterState, BudgetRange, Restaurant } from '../types';
import { ALL_DISTRICTS } from '../utils/urlState';
import { MACRO_CUISINES } from '../utils/cuisineMapping';
import {
  Coins,
  MapPin,
  UtensilsCrossed,
  Clock,
  Check,
  X,
  ListFilter,
  Map,
  RotateCcw,
} from 'lucide-react';

interface LeftIconNavProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  allRestaurants: Restaurant[];
  matchedCount: number;
  onOpenList: () => void;
  onOpenMap: () => void;
}

type ActivePanel = 'price' | 'district' | 'cuisine' | null;

const BUDGET_OPTIONS: { label: string; value: BudgetRange; desc: string }[] = [
  { label: '不限預算', value: 'all', desc: '任何價位皆可' },
  { label: '~100 元', value: '100', desc: '銅板小吃、輕食' },
  { label: '100–200 元', value: '100-200', desc: '定食便當、一般正餐' },
  { label: '200–400 元', value: '200-400', desc: '聚餐、拉麵排餐' },
  { label: '400–800 元', value: '400-800', desc: '燒肉火鍋、中高價位' },
  { label: '800 元以上', value: '800+', desc: '無菜單、頂級吃到飽' },
];

export const LeftIconNav: React.FC<LeftIconNavProps> = ({
  filters,
  onFilterChange,
  allRestaurants,
  matchedCount,
  onOpenList,
  onOpenMap,
}) => {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close panel on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    if (activePanel) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [activePanel]);

  // Escape key closes side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActivePanel(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const togglePanel = (panel: ActivePanel) => {
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  const handleToggleDistrict = (d: DistrictName) => {
    let next: DistrictName[];
    if (filters.districts.includes(d)) {
      next = filters.districts.filter((item) => item !== d);
    } else {
      next = [...filters.districts, d];
    }
    onFilterChange({ ...filters, districts: next });
  };

  const handleToggleMacroCuisine = (id: string) => {
    const current = filters.macroCuisines || [];
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((item) => item !== id);
    } else {
      next = [...current, id];
    }
    onFilterChange({ ...filters, macroCuisines: next });
  };

  // District counts
  const districtCounts: Record<DistrictName, number> = {
    桃園區: 0,
    中壢區: 0,
    蘆竹區: 0,
    龜山區: 0,
    八德區: 0,
    大園區: 0,
    大溪區: 0,
    平鎮區: 0,
  };
  allRestaurants.forEach((r) => {
    if (r.district && r.district in districtCounts) {
      districtCounts[r.district as DistrictName]++;
    }
  });

  // Macro cuisine counts
  const macroCounts: Record<string, number> = {};
  MACRO_CUISINES.forEach((m) => {
    macroCounts[m.id] = allRestaurants.filter((r) =>
      r.cuisine.some((c) => m.subCuisines.includes(c))
    ).length;
  });

  const isPriceFiltered = filters.budget !== 'all';
  const isDistrictFiltered = filters.districts.length < ALL_DISTRICTS.length;
  const isCuisineFiltered = Boolean(filters.macroCuisines && filters.macroCuisines.length > 0);

  return (
    <div ref={containerRef} className="fixed left-0 top-0 bottom-0 z-40 flex pointer-events-none">
      {/* 1. Slim Vertical Icon Bar (Only Icons) */}
      <div className="w-14 sm:w-16 h-full bg-[var(--bg-card)] border-r border-[var(--border-subtle)] shadow-md flex flex-col items-center py-5 justify-between pointer-events-auto select-none">
        {/* Top filter icons */}
        <div className="flex flex-col items-center gap-3 w-full px-2">
          {/* 價格 Icon */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => togglePanel('price')}
              aria-label="價格預算篩選"
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative ${
                activePanel === 'price'
                  ? 'bg-[var(--accent-base)] text-white shadow-md'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]'
              }`}
            >
              <Coins className="w-5 h-5" />
              {isPriceFiltered && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              價格
            </span>
          </div>

          {/* 區域 Icon */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => togglePanel('district')}
              aria-label="行政區域篩選"
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative ${
                activePanel === 'district'
                  ? 'bg-[var(--accent-base)] text-white shadow-md'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]'
              }`}
            >
              <MapPin className="w-5 h-5" />
              {isDistrictFiltered && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              區域
            </span>
          </div>

          {/* 類型 Icon */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => togglePanel('cuisine')}
              aria-label="料理大類篩選"
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative ${
                activePanel === 'cuisine'
                  ? 'bg-[var(--accent-base)] text-white shadow-md'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] border border-[var(--border-subtle)]'
              }`}
            >
              <UtensilsCrossed className="w-5 h-5" />
              {isCuisineFiltered && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
              )}
            </button>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              類型
            </span>
          </div>

          {/* 營業狀態 Icon (直接切換開門 / 不限) */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, openNow: !filters.openNow })}
              aria-label={filters.openNow ? '切換為不限營業時段' : '只看現在營業中'}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                filters.openNow
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              <Clock className="w-5 h-5" />
            </button>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {filters.openNow ? '只看營業中' : '不限時段'}
            </span>
          </div>
        </div>

        {/* Bottom auxiliary icons: List & Map */}
        <div className="flex flex-col items-center gap-3 w-full px-2 border-t border-[var(--border-subtle)] pt-4">
          {/* 名單 Icon */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={onOpenList}
              aria-label="查看符合名單"
              className="w-10 h-10 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] flex items-center justify-center transition-colors"
            >
              <ListFilter className="w-4 h-4" />
            </button>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              名單 ({matchedCount})
            </span>
          </div>

          {/* 地圖 Icon */}
          <div className="relative group w-full flex justify-center">
            <button
              type="button"
              onClick={onOpenMap}
              aria-label="查看行政區地圖"
              className="w-10 h-10 rounded-xl bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--accent-base)] border border-[var(--border-subtle)] flex items-center justify-center transition-colors"
            >
              <Map className="w-4 h-4" />
            </button>
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-[11px] font-medium rounded shadow-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              行政區分布圖
            </span>
          </div>
        </div>
      </div>

      {/* 2. Longitudinal Side Panel (旁邊出現一縱向選單，不是彈跳置中視窗) */}
      {activePanel && (
        <div className="w-72 sm:w-80 h-full bg-[var(--bg-card)] border-r border-[var(--border-strong)] shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-left duration-200 select-none">
          {/* Panel Top Title */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-2">
              {activePanel === 'price' && <Coins className="w-5 h-5 text-[var(--accent-base)]" />}
              {activePanel === 'district' && <MapPin className="w-5 h-5 text-[var(--accent-base)]" />}
              {activePanel === 'cuisine' && <UtensilsCrossed className="w-5 h-5 text-[var(--accent-base)]" />}
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {activePanel === 'price' && '價格預算'}
                {activePanel === 'district' && '行政區域'}
                {activePanel === 'cuisine' && '料理大類（公約數）'}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Longitudinal Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Price Longitudinal Options */}
            {activePanel === 'price' && (
              <div className="space-y-1.5">
                {BUDGET_OPTIONS.map((opt) => {
                  const isSelected = filters.budget === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onFilterChange({ ...filters, budget: opt.value });
                        setActivePanel(null);
                      }}
                      className={`w-full p-3 rounded-xl text-left touch-target transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'bg-[var(--accent-light)] border-[var(--accent-base)] text-[var(--accent-base)] font-bold shadow-2xs'
                          : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] text-[var(--text-secondary)]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-[var(--text-primary)]">{opt.label}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">{opt.desc}</div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[var(--accent-base)]" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* District Longitudinal Options */}
            {activePanel === 'district' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-[var(--text-muted)]">
                    已選 {filters.districts.length} / 8 區
                  </span>
                  <div className="flex items-center gap-2 font-medium">
                    <button
                      type="button"
                      onClick={() => onFilterChange({ ...filters, districts: [...ALL_DISTRICTS] })}
                      className="text-[var(--accent-base)] hover:underline"
                    >
                      全選
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => onFilterChange({ ...filters, districts: [] })}
                      className="text-[var(--text-muted)] hover:underline"
                    >
                      清空
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {ALL_DISTRICTS.map((d) => {
                    const isSelected = filters.districts.includes(d);
                    const count = districtCounts[d] || 0;
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleToggleDistrict(d)}
                        className={`w-full p-2.5 rounded-xl text-left touch-target transition-colors flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[var(--accent-light)] border-[var(--accent-base)] text-[var(--accent-base)] font-bold'
                            : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-80 hover:opacity-100'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs">
                          {isSelected ? (
                            <Check className="w-4 h-4 text-[var(--accent-base)]" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-[var(--border-strong)]" />
                          )}
                          <span>{d}</span>
                        </span>
                        <span className="text-[11px] font-mono text-[var(--text-muted)]">
                          {count} 家
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cuisine Longitudinal Options (6 大公約數) */}
            {activePanel === 'cuisine' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-1 pb-1">
                  <span className="text-[var(--text-muted)]">6 大類別可多選（預設不限）</span>
                  {filters.macroCuisines && filters.macroCuisines.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onFilterChange({ ...filters, macroCuisines: [] })}
                      className="text-[var(--accent-base)] font-medium hover:underline"
                    >
                      不限
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {MACRO_CUISINES.map((macro) => {
                    const isSelected = (filters.macroCuisines || []).includes(macro.id);
                    const count = macroCounts[macro.id] || 0;
                    return (
                      <button
                        key={macro.id}
                        type="button"
                        onClick={() => handleToggleMacroCuisine(macro.id)}
                        className={`w-full p-2.5 rounded-xl text-left touch-target transition-colors flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[var(--accent-light)] border-[var(--accent-base)] text-[var(--accent-base)] font-bold'
                            : 'bg-[var(--bg-card-subtle)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl">{macro.emoji}</span>
                          <div>
                            <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                              <span>{macro.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] font-mono text-[var(--text-muted)]">
                                {count} 家
                              </span>
                            </div>
                            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 line-clamp-1">
                              {macro.description}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-[var(--accent-base)] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[var(--border-strong)] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Panel Bottom Info */}
          <div className="p-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">
              目前符合候選：<strong className="text-[var(--accent-base)]">{matchedCount}</strong> 家
            </span>
            <button
              type="button"
              onClick={() => setActivePanel(null)}
              className="px-3 py-1.5 rounded-lg bg-[var(--accent-base)] text-white font-bold text-xs"
            >
              完成
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
