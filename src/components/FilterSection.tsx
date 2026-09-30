import React, { useState } from 'react';
import { DistrictName, FilterState, BudgetRange } from '../types';
import { ALL_DISTRICTS } from '../utils/urlState';
import { Clock, DollarSign, MapPin, Utensils, X, Search, Check } from 'lucide-react';

interface FilterSectionProps {
  filters: FilterState;
  allCuisines: string[];
  totalAvailable: number;
  matchedCount: number;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
}

const BUDGET_OPTIONS: { label: string; value: BudgetRange }[] = [
  { label: '不限', value: 'all' },
  { label: '~100', value: '100' },
  { label: '100–200', value: '100-200' },
  { label: '200–400', value: '200-400' },
  { label: '400–800', value: '400-800' },
  { label: '800+', value: '800+' },
];

export const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  allCuisines,
  totalAvailable,
  matchedCount,
  onFilterChange,
  onResetFilters,
}) => {
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [showAllCuisines, setShowAllCuisines] = useState(false);

  // Toggle district
  const handleToggleDistrict = (d: DistrictName) => {
    let next: DistrictName[];
    if (filters.districts.includes(d)) {
      next = filters.districts.filter((item) => item !== d);
    } else {
      next = [...filters.districts, d];
    }
    onFilterChange({ ...filters, districts: next });
  };

  const handleSelectAllDistricts = () => {
    onFilterChange({ ...filters, districts: [...ALL_DISTRICTS] });
  };

  const handleClearDistricts = () => {
    onFilterChange({ ...filters, districts: [] });
  };

  // Toggle cuisine
  const handleToggleCuisine = (c: string) => {
    let next: string[];
    if (filters.cuisines.includes(c)) {
      next = filters.cuisines.filter((item) => item !== c);
    } else {
      next = [...filters.cuisines, c];
    }
    onFilterChange({ ...filters, cuisines: next });
  };

  const handleClearCuisines = () => {
    onFilterChange({ ...filters, cuisines: [] });
  };

  // Filter cuisines by search
  const filteredCuisines = cuisineSearch.trim()
    ? allCuisines.filter((c) => c.toLowerCase().includes(cuisineSearch.toLowerCase()))
    : allCuisines;

  // Show top 18 cuisines when collapsed, or all when expanded
  const visibleCuisines = showAllCuisines ? filteredCuisines : filteredCuisines.slice(0, 18);

  return (
    <div className="space-y-5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-5 shadow-xs">
      {/* 1. 營業狀態開關 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--accent-base)]" />
          <div>
            <span className="font-semibold text-sm text-[var(--text-primary)]">現在營業中</span>
            <p className="text-xs text-[var(--text-muted)]">
              以當前時間自動濾除打烊與公休店家（含跨午夜 12 家特例支援）
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.openNow}
            onChange={(e) => onFilterChange({ ...filters, openNow: e.target.checked })}
            className="sr-only peer"
            aria-label="只顯示現在營業中的店家"
          />
          <div className="w-12 h-6 bg-[var(--bg-card-subtle)] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--focus-ring)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent-base)] border border-[var(--border-strong)]"></div>
          <span className="ml-2 text-xs font-medium text-[var(--text-secondary)]">
            {filters.openNow ? '只看開門店家' : '不限營業時段'}
          </span>
        </label>
      </div>

      {/* 2. 預算單選 (Budget) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
            <DollarSign className="w-4 h-4 text-[var(--accent-base)]" />
            <span>預算區間（單選）</span>
          </div>
          {filters.budget !== 'all' && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, budget: 'all' })}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-base)]"
            >
              清除預算
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="預算區間">
          {BUDGET_OPTIONS.map((opt) => {
            const isSelected = filters.budget === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onFilterChange({ ...filters, budget: opt.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium touch-target transition-colors flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[var(--accent-base)] text-white border-[var(--accent-base)] shadow-xs'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 桃園行政區 Chips (Districts) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
            <MapPin className="w-4 h-4 text-[var(--accent-base)]" />
            <span>行政區（多選）</span>
            <span className="text-xs font-normal text-[var(--text-muted)]">
              ({filters.districts.length}/{ALL_DISTRICTS.length})
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleSelectAllDistricts}
              className="text-[var(--accent-base)] hover:underline font-medium"
            >
              全選
            </button>
            <span className="text-[var(--border-strong)]">|</span>
            <button
              type="button"
              onClick={handleClearDistricts}
              className="text-[var(--text-muted)] hover:underline"
            >
              清空
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_DISTRICTS.map((d) => {
            const isSelected = filters.districts.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleToggleDistrict(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium touch-target transition-colors flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-[var(--accent-light)] text-[var(--accent-base)] border-[var(--accent-border)] font-semibold'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-base)]" />}
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 料理類型 Chips (Cuisines) */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
            <Utensils className="w-4 h-4 text-[var(--accent-base)]" />
            <span>類型（多選，預設不限）</span>
            {filters.cuisines.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-base)] text-white">
                已選 {filters.cuisines.length} 項
              </span>
            )}
          </div>
          {filters.cuisines.length > 0 && (
            <button
              type="button"
              onClick={handleClearCuisines}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-base)] flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清空類型
            </button>
          )}
        </div>

        {/* Quick search inside cuisine list */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={cuisineSearch}
            onChange={(e) => setCuisineSearch(e.target.value)}
            placeholder="搜尋料理類型（如：早午餐、拉麵、熱炒...）"
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] text-[var(--text-primary)]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
          {visibleCuisines.map((c) => {
            const isSelected = filters.cuisines.includes(c);
            return (
              <button
                key={c}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleToggleCuisine(c)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors flex items-center gap-1 border ${
                  isSelected
                    ? 'bg-[var(--accent-base)] text-white border-[var(--accent-base)] shadow-2xs'
                    : 'bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--border-strong)]'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {c}
              </button>
            );
          })}
        </div>

        {filteredCuisines.length > 18 && (
          <button
            type="button"
            onClick={() => setShowAllCuisines(!showAllCuisines)}
            className="text-xs text-[var(--accent-base)] hover:underline font-medium block pt-1"
          >
            {showAllCuisines ? '收合部分類型' : `展開更多類型（共 ${filteredCuisines.length} 種）`}
          </button>
        )}
      </div>

      {/* Reset all button */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
        <span className="text-[var(--text-muted)]">
          總收錄 {totalAvailable} 家 · 目前符合 {matchedCount} 家
        </span>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-[var(--text-secondary)] hover:text-[var(--accent-base)] hover:underline py-1 px-2"
        >
          還原預設條件
        </button>
      </div>
    </div>
  );
};
