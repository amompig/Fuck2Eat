import React from 'react';
import { DistrictName, Restaurant } from '../types';

interface TaoyuanSvgMapProps {
  restaurants: Restaurant[];
  selectedDistricts: DistrictName[];
  onToggleDistrict: (district: DistrictName) => void;
  onSelectAllDistricts: () => void;
}

// 8 Taoyuan districts relative layout positions in SVG coordinates (500 x 420 viewBox)
// Topological layout preserving boundaries and relative geography
const DISTRICT_PATHS: {
  id: DistrictName;
  d: string;
  labelX: number;
  labelY: number;
}[] = [
  {
    // 大園區 (Northwest)
    id: '大園區',
    d: 'M 70 60 L 160 40 L 190 90 L 170 140 L 110 160 L 60 110 Z',
    labelX: 120,
    labelY: 95,
  },
  {
    // 蘆竹區 (North-Central)
    id: '蘆竹區',
    d: 'M 160 40 L 270 30 L 290 90 L 250 145 L 170 140 L 190 90 Z',
    labelX: 220,
    labelY: 85,
  },
  {
    // 龜山區 (Northeast)
    id: '龜山區',
    d: 'M 270 30 L 390 45 L 430 110 L 370 180 L 300 160 L 250 145 L 290 90 Z',
    labelX: 335,
    labelY: 105,
  },
  {
    // 桃園區 (Central-East)
    id: '桃園區',
    d: 'M 250 145 L 300 160 L 370 180 L 350 240 L 270 245 L 230 190 Z',
    labelX: 290,
    labelY: 195,
  },
  {
    // 中壢區 (Central-West)
    id: '中壢區',
    d: 'M 110 160 L 170 140 L 230 190 L 210 270 L 130 260 L 95 210 Z',
    labelX: 165,
    labelY: 205,
  },
  {
    // 八德區 (East / Southeast of Taoyuan District)
    id: '八德區',
    d: 'M 270 245 L 350 240 L 380 300 L 310 325 L 255 280 Z',
    labelX: 310,
    labelY: 280,
  },
  {
    // 平鎮區 (South of Zhongli)
    id: '平鎮區',
    d: 'M 130 260 L 210 270 L 255 280 L 240 345 L 155 350 L 120 310 Z',
    labelX: 185,
    labelY: 305,
  },
  {
    // 大溪區 (Southeast)
    id: '大溪區',
    d: 'M 310 325 L 380 300 L 420 360 L 360 410 L 270 380 L 240 345 Z',
    labelX: 330,
    labelY: 360,
  },
];

export const TaoyuanSvgMap: React.FC<TaoyuanSvgMapProps> = ({
  restaurants,
  selectedDistricts,
  onToggleDistrict,
  onSelectAllDistricts,
}) => {
  // Count matching restaurants per district
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

  restaurants.forEach((r) => {
    if (r.district && r.district in districtCounts) {
      districtCounts[r.district as DistrictName]++;
    }
  });

  const maxCount = Math.max(...Object.values(districtCounts), 1);

  // Compute single accent lightness scale (OKLCH Amber/Ochre)
  // Higher count = richer/darker shade in light mode, more glowing in dark mode
  const getFillColor = (count: number, isSelected: boolean) => {
    if (!isSelected) {
      return 'var(--bg-card-subtle)';
    }
    if (count === 0) {
      return 'oklch(0.92 0.02 50)';
    }
    const ratio = count / maxCount; // 0 to 1
    // Interpolate lightness from 0.88 down to 0.65 for selected districts
    const lightness = 0.88 - ratio * 0.24;
    const chroma = 0.06 + ratio * 0.10;
    return `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} 48)`;
  };

  return (
    <div className="w-full bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--accent-base)]" />
            桃園行政區分布圖（Tier 1 區塊圖）
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            點擊區塊切換篩選，明度階代表當前條件符合家數
          </p>
        </div>

        <button
          type="button"
          onClick={onSelectAllDistricts}
          className="text-xs font-medium text-[var(--accent-base)] hover:underline focus-visible:ring-2 px-2 py-1 rounded touch-target flex items-center"
        >
          全選 8 區
        </button>
      </div>

      <div className="relative w-full aspect-[5/3.8] max-w-lg mx-auto">
        <svg
          viewBox="40 15 420 405"
          className="w-full h-full select-none"
          role="img"
          aria-label="桃園 8 行政區分布互動地圖"
        >
          <g>
            {DISTRICT_PATHS.map((item) => {
              const count = districtCounts[item.id] || 0;
              const isSelected = selectedDistricts.includes(item.id);
              const fillColor = getFillColor(count, isSelected);

              return (
                <g
                  key={item.id}
                  className="cursor-pointer transition-opacity"
                  onClick={() => onToggleDistrict(item.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${item.id}，目前符合 ${count} 間店家，點擊切換`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onToggleDistrict(item.id);
                    }
                  }}
                >
                  <path
                    d={item.d}
                    fill={fillColor}
                    stroke={isSelected ? 'var(--accent-base)' : 'var(--border-strong)'}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeLinejoin="round"
                    className="transition-colors hover:brightness-95 active:brightness-90"
                  />
                  {/* District Name Label */}
                  <text
                    x={item.labelX}
                    y={item.labelY - 5}
                    textAnchor="middle"
                    className="font-medium text-xs pointer-events-none fill-[var(--text-primary)]"
                    style={{ fontSize: '11px', fontWeight: isSelected ? 600 : 400 }}
                  >
                    {item.id}
                  </text>
                  {/* Count Badge */}
                  <text
                    x={item.labelX}
                    y={item.labelY + 11}
                    textAnchor="middle"
                    className="text-[10px] pointer-events-none fill-[var(--text-secondary)]"
                    style={{ fontSize: '10px' }}
                  >
                    {count} 間
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-subtle)] px-1">
        <span>分布圖不耗任何 API Key · 點擊區塊即雙向同步篩選</span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-2.5 rounded bg-[var(--bg-card-subtle)] border border-[var(--border-subtle)]" />
          未選
          <span
            className="inline-block w-3 h-2.5 rounded"
            style={{ backgroundColor: 'var(--accent-base)' }}
          />
          已選（多）
        </span>
      </div>
    </div>
  );
};
