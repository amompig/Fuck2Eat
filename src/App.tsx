import React, { useState, useEffect, useMemo, useTransition } from 'react';
import seedRaw from './data/seed.json';
import {
  Restaurant,
  SeedData,
  FilterState,
  DistrictName,
  SimulationTime,
} from './types';
import {
  ALL_DISTRICTS,
  parseFiltersFromUrl,
  syncFiltersToUrl,
  getSelectedIdFromUrl,
} from './utils/urlState';
import { filterRestaurants } from './utils/filterEngine';
import { Header } from './components/Header';
import { Gashapon2D } from './components/Gashapon2D';
import { TimeWidget } from './components/TimeWidget';
import { LeftIconNav } from './components/LeftIconNav';
import { WinnerModal } from './components/WinnerModal';
import { VerificationDrawer } from './components/VerificationDrawer';
import { RestaurantListModal } from './components/RestaurantListModal';
import { TaoyuanSvgMap } from './components/TaoyuanSvgMap';

const seedData = seedRaw as unknown as SeedData;

export default function App() {
  const [, startTransition] = useTransition();

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taoyuan_food_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taoyuan_food_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taoyuan_food_theme', 'light');
    }
  }, [isDarkMode]);

  // Current or Simulated Time
  const [simTime, setSimTime] = useState<SimulationTime>(() => {
    const now = new Date();
    return {
      isSimulated: false,
      day: now.getDay(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    };
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>(() => parseFiltersFromUrl());

  // Weighted mode
  const [isWeighted, setIsWeighted] = useState<boolean>(false);

  // Winner modal state
  const [winner, setWinner] = useState<Restaurant | null>(() => {
    const urlId = getSelectedIdFromUrl();
    if (urlId) {
      return seedData.restaurants.find((r) => r.id === urlId) || null;
    }
    return null;
  });
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState<boolean>(false);
  const [respinCount, setRespinCount] = useState<number>(0);

  // Other auxiliary modals
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);

  // Sync state to URL
  useEffect(() => {
    syncFiltersToUrl(filters, winner?.id || null);
  }, [filters, winner]);

  // Filtered pool
  const matchedRestaurants = useMemo(() => {
    return filterRestaurants(seedData.restaurants, filters, simTime);
  }, [filters, simTime]);

  // Handle winner from Gashapon Machine
  const handleWinnerSelected = (picked: Restaurant) => {
    setWinner(picked);
    setIsWinnerModalOpen(true);

    try {
      const history = JSON.parse(localStorage.getItem('taoyuan_food_history') || '[]');
      history.push({
        id: picked.id,
        name: picked.name,
        mode: isWeighted ? 'weighted' : 'fair',
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem('taoyuan_food_history', JSON.stringify(history.slice(-50)));
    } catch {
      // Ignore
    }
  };

  const handleRedraw = () => {
    setRespinCount((c) => c + 1);
    setIsWinnerModalOpen(false);
  };

  const handleToggleDistrict = (d: DistrictName) => {
    startTransition(() => {
      let next: DistrictName[];
      if (filters.districts.includes(d)) {
        next = filters.districts.filter((item) => item !== d);
      } else {
        next = [...filters.districts, d];
      }
      setFilters((prev) => ({ ...prev, districts: next }));
    });
  };

  const handleSelectAllDistricts = () => {
    startTransition(() => {
      setFilters((prev) => ({ ...prev, districts: [...ALL_DISTRICTS] }));
    });
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors select-none">
      {/* Top Header: 標題居中 */}
      <Header
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Left Icon Rail + Longitudinal Flyout Menu (僅圖示，點擊在旁邊縱向滑出選項) */}
      <LeftIconNav
        filters={filters}
        onFilterChange={setFilters}
        allRestaurants={seedData.restaurants}
        matchedCount={matchedRestaurants.length}
        onOpenList={() => setIsListModalOpen(true)}
        onOpenMap={() => setShowMapModal(true)}
      />

      {/* Main Focus: 一頁式置中，手機不擁擠，無需任何滾動 */}
      <main className="flex-1 min-h-0 w-full overflow-hidden relative flex items-center justify-center pl-14 sm:pl-20 pr-2 sm:pr-4 py-1">
        {/* 電腦端放置於扭蛋機右側，手機端自然置於右上角，完全不擠壓扭蛋機 */}
        <div className="w-full h-full max-w-3xl flex items-center justify-center relative">
          {/* 扭蛋機本體置中 */}
          <Gashapon2D
            eligibleRestaurants={matchedRestaurants}
            isWeighted={isWeighted}
            onToggleWeighted={setIsWeighted}
            onWinnerSelected={handleWinnerSelected}
            disabled={matchedRestaurants.length === 0}
          />

          {/* 時間等資訊：手機端固定在右上角，電腦端位於右側 */}
          <div className="absolute top-2 right-2 sm:static sm:ml-6 shrink-0 z-10">
            <TimeWidget
              simTime={simTime}
              onSetSimulationTime={setSimTime}
            />
          </div>
        </div>
      </main>

      {/* ⚪ 扭出後直接彈出視窗 (Winner Modal: 快速知道可以吃啥) */}
      <WinnerModal
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        restaurant={winner}
        onRedraw={handleRedraw}
        respinCount={respinCount}
      />

      {/* Auxiliary List Modal */}
      <RestaurantListModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        restaurants={matchedRestaurants}
        onSelectRestaurant={(r) => {
          setWinner(r);
          setIsListModalOpen(false);
          setIsWinnerModalOpen(true);
        }}
      />

      {/* Auxiliary District Map Modal */}
      {showMapModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="桃園行政區分布圖"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-strong)] shadow-2xl relative">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                桃園行政區分布圖
              </h3>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-card-subtle)]"
              >
                關閉
              </button>
            </div>
            <TaoyuanSvgMap
              restaurants={matchedRestaurants}
              selectedDistricts={filters.districts}
              onToggleDistrict={handleToggleDistrict}
              onSelectAllDistricts={handleSelectAllDistricts}
            />
          </div>
        </div>
      )}

      {/* Verification Drawer & Acceptance Inspector */}
      <VerificationDrawer
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        allRestaurants={seedData.restaurants}
      />
    </div>
  );
}
