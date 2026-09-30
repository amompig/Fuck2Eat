import React, { useState } from 'react';
import { Restaurant } from '../types';
import { getCryptoRandom } from '../utils/random';

interface Gashapon2DProps {
  eligibleRestaurants: Restaurant[];
  isWeighted: boolean;
  onToggleWeighted: (weighted: boolean) => void;
  onWinnerSelected: (restaurant: Restaurant) => void;
  disabled: boolean;
}

interface CapsuleItem {
  id: string;
  x: number;
  y: number;
  rot: number;
  topColor: string;
  bottomColor: string;
  scale: number;
}

// Capsules positioned naturally inside the chamber (behind the front white guide scoop)
const MACHINE_CAPSULES: CapsuleItem[] = [
  { id: 'c1', x: 44, y: 55, rot: -15, topColor: '#dc2626', bottomColor: '#ffffff', scale: 1.1 },   // Red dome
  { id: 'c2', x: 104, y: 50, rot: 15, topColor: '#2563eb', bottomColor: '#ffffff', scale: 1.05 }, // Blue dome
  { id: 'c3', x: 142, y: 44, rot: -5, topColor: '#eab308', bottomColor: '#ffffff', scale: 1.0 },   // Yellow dome
  { id: 'c4', x: 168, y: 38, rot: 30, topColor: '#1d4ed8', bottomColor: '#ffffff', scale: 0.95 },  // Deep blue dome
  { id: 'c5', x: 74, y: 40, rot: -20, topColor: '#ffffff', bottomColor: '#dc2626', scale: 0.9 },   // Back red
];

export const Gashapon2D: React.FC<Gashapon2DProps> = ({
  eligibleRestaurants,
  isWeighted,
  onToggleWeighted,
  onWinnerSelected,
  disabled,
}) => {
  const [isCranking, setIsCranking] = useState(false);
  const [knobDegree, setKnobDegree] = useState(0);
  const [dispensedBall, setDispensedBall] = useState<CapsuleItem | null>(null);

  const handleCrank = () => {
    if (disabled || isCranking || eligibleRestaurants.length === 0) return;

    // Pick winner
    let winner: Restaurant;
    if (isWeighted) {
      const weights = eligibleRestaurants.map((r) =>
        r.confidence === 'high' ? 3 : r.confidence === 'med' ? 2 : 1
      );
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      let rand = getCryptoRandom() * totalWeight;
      let pickedIndex = 0;
      for (let i = 0; i < eligibleRestaurants.length; i++) {
        rand -= weights[i];
        if (rand <= 0) {
          pickedIndex = i;
          break;
        }
      }
      winner = eligibleRestaurants[pickedIndex];
    } else {
      const randIdx = Math.floor(getCryptoRandom() * eligibleRestaurants.length);
      winner = eligibleRestaurants[randIdx];
    }

    const pickedBall = MACHINE_CAPSULES[Math.floor(Math.random() * MACHINE_CAPSULES.length)];

    setIsCranking(true);
    setDispensedBall(null);

    // Smooth mechanical crank rotation (720 degrees over 1.3s)
    setKnobDegree((prev) => prev + 720);

    // 1. 1.25s: 轉把旋轉完成，扭蛋平順滑落至出貨口底盤
    setTimeout(() => {
      setDispensedBall(pickedBall);
    }, 1250);

    // 2. 2.1s: 使用者清晰看到出貨口的實體扭蛋後，彈出卡片
    setTimeout(() => {
      setIsCranking(false);
      onWinnerSelected(winner);
    }, 2100);
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-[260px] sm:max-w-[290px] shrink-0 my-auto">
      {/* Top Header Mode Toggle */}
      <div className="w-full flex items-center justify-between mb-1.5 px-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-[var(--text-primary)]">
            可選：{eligibleRestaurants.length} 間
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-0.5 rounded-lg text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => onToggleWeighted(false)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              !isWeighted
                ? 'bg-[var(--text-primary)] text-[var(--bg-card)] font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            公平
          </button>
          <button
            type="button"
            onClick={() => onToggleWeighted(true)}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              isWeighted
                ? 'bg-[var(--accent-base)] text-white font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            加權
          </button>
        </div>
      </div>

      {/* 2D Gashapon Cabinet (嚴格參照參考照片) */}
      <div className="w-full bg-white rounded-3xl border-4 border-gray-300 shadow-2xl overflow-hidden flex flex-col relative text-gray-800">
        {/* Top Header Brand Bar */}
        <div className="bg-white border-b border-gray-200 px-3 py-1 flex items-center justify-center">
          <div className="inline-flex items-center gap-1">
            <span className="w-3.5 h-3.5 bg-red-600 text-white font-black text-[9px] flex items-center justify-center rounded-xs">
              B
            </span>
            <span className="text-[10px] font-black tracking-widest text-red-600">
              BANDAI
            </span>
          </div>
        </div>

        {/* Upper Clear Showcase Chamber (透視壓克力與內部弧形白色引導盤) */}
        <div className="relative w-full h-38 sm:h-44 bg-gradient-to-b from-[#f9ece1] via-[#f7e6d6] to-[#f2dac5] p-2 overflow-hidden border-b-4 border-gray-300">
          {/* Glass reflection highlight */}
          <div className="absolute top-2 left-3 w-32 h-10 bg-white/50 rounded-full blur-xs -rotate-12 pointer-events-none z-30" />

          {/* 1. LAYER 1: Capsules sitting in the back (位於引導盤後方，旋轉時僅輕微沉靜位移，不大幅跳躍) */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              {MACHINE_CAPSULES.map((c, idx) => {
                const r = 26 * c.scale;
                // 自然細微翻滾位移 (小於 1.5px)，杜絕突兀彈跳
                const subtleShiftX = isCranking ? (idx % 2 === 0 ? 1 : -1) : 0;
                const subtleShiftY = isCranking ? (idx % 2 === 0 ? 0.8 : -0.8) : 0;
                const subtleRot = isCranking ? (idx % 2 === 0 ? 4 : -4) : 0;

                return (
                  <g
                    key={c.id}
                    transform={`translate(${c.x + subtleShiftX}, ${c.y + subtleShiftY}) rotate(${c.rot + subtleRot})`}
                    style={{ transition: 'transform 0.4s ease-out' }}
                  >
                    {/* Shadow */}
                    <ellipse cx="0" cy={r * 0.9} rx={r * 0.8} ry={r * 0.25} fill="#000000" opacity="0.12" />
                    {/* Bottom half */}
                    <circle cx="0" cy="0" r={r} fill={c.bottomColor} stroke="#cbd5e1" strokeWidth="1.2" />
                    {/* Top half */}
                    <path
                      d={`M -${r} 0 A ${r} ${r} 0 0 1 ${r} 0 Z`}
                      fill={c.topColor}
                    />
                    {/* Equator divider line */}
                    <line x1={-r} y1="0" x2={r} y2="0" stroke="#94a3b8" strokeWidth="1.4" />
                    {/* Venting holes */}
                    <circle cx={-r * 0.4} cy={-r * 0.35} r="1.3" fill="#000000" opacity="0.25" />
                    <circle cx={r * 0.4} cy={-r * 0.35} r="1.3" fill="#000000" opacity="0.25" />
                    {/* Gloss sheen */}
                    <ellipse
                      cx={-r * 0.3}
                      cy={-r * 0.4}
                      rx={r * 0.35}
                      ry={r * 0.18}
                      fill="#ffffff"
                      opacity="0.5"
                      transform="rotate(-20)"
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 2. LAYER 2: 白色引導盤位於扭蛋外面（前景覆蓋扭蛋下半部） */}
          <div className="absolute bottom-0 inset-x-2 h-18 bg-white/95 rounded-t-3xl border-2 border-gray-200 shadow-md z-20 flex justify-around items-end pb-1 px-3 pointer-events-none">
            {/* 3 Vertical divider ribs */}
            <div className="w-2 h-12 bg-gradient-to-t from-gray-200 to-white rounded-t-full shadow-md border-t border-gray-100" />
            <div className="w-2 h-14 bg-gradient-to-t from-gray-200 to-white rounded-t-full shadow-md border-t border-gray-100" />
            <div className="w-2 h-12 bg-gradient-to-t from-gray-200 to-white rounded-t-full shadow-md border-t border-gray-100" />
          </div>
        </div>

        {/* Lower Control Faceplate */}
        <div className="p-3 bg-white flex flex-col space-y-2.5">
          {/* Top Row: Coin Decals & Silver Coin Slot (coin in 緊鄰投幣孔左側) */}
          <div className="flex items-center justify-between px-1">
            {/* Left: Blue Coin Decal */}
            <div className="bg-[#1e40af] text-white px-2 py-0.5 rounded text-[8.5px] font-bold shadow-xs">
              <span>コイン COIN 1枚</span>
            </div>

            {/* Right: Coin In 緊鄰投幣孔 */}
            <div className="flex items-center gap-1.5">
              <div className="bg-[#1e40af] text-white px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1 shadow-xs">
                <span>コイン COIN IN</span>
                <span className="text-[7px]">▶</span>
              </div>

              {/* Circular Metal Coin Slot */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-100 via-gray-200 to-gray-300 border-2 border-gray-400 flex items-center justify-center shadow-inner relative">
                <div className="w-1.2 h-4.5 bg-red-950 rounded-full shadow-xs" />
                <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-gray-400" />
              </div>
            </div>
          </div>

          {/* Central Rotary Turn Knob (點擊此旋鈕即可旋轉出蛋) */}
          <div className="flex flex-col items-center justify-center py-0.5">
            <div className="relative">
              {/* Blue Direction Ring with Arrow */}
              <div className="w-19 h-19 sm:w-21 sm:h-21 rounded-full border-4 border-blue-600 flex items-center justify-center p-1 relative shadow-inner bg-blue-50/30">
                {/* Yellow Rotation Arrow Indicator */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-blue-900 text-[8.5px] font-black px-1.5 py-0.2 rounded-full border border-blue-700 shadow-xs">
                  ↻ 迴轉
                </div>

                {/* White Turn Knob */}
                <button
                  type="button"
                  onClick={handleCrank}
                  disabled={disabled || isCranking}
                  title="點擊旋轉出蛋"
                  aria-label="點擊旋轉出蛋"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-white via-gray-100 to-gray-200 border-2 border-gray-300 shadow-lg flex items-center justify-center cursor-pointer transition-transform active:scale-95 touch-target"
                  style={{
                    transform: `rotate(${knobDegree}deg)`,
                    transition: isCranking
                      ? 'transform 1.3s cubic-bezier(0.25, 1, 0.5, 1)'
                      : 'none',
                  }}
                >
                  {/* Wing Grip */}
                  <div className="w-13 h-4.5 bg-white border border-gray-300 rounded-lg shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-600" />
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row: 大尺寸出貨口 & 右側日式注意標籤與退幣槽 */}
          <div className="flex items-stretch justify-between pt-0.5">
            {/* 左側大尺寸出蛋口 */}
            <div className="w-26 sm:w-30 h-20 sm:h-22 bg-gradient-to-b from-stone-800 via-stone-900 to-black rounded-2xl border-3 border-gray-400 shadow-inner flex items-center justify-center relative overflow-hidden p-1.5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

              {/* 掉落出的扭蛋 (自然滑入底座，不大幅彈跳) */}
              {dispensedBall && (
                <div
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-white shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-top-3 duration-250 ease-out"
                  style={{
                    transform: `rotate(${dispensedBall.rot}deg)`,
                  }}
                >
                  {/* Top half */}
                  <div
                    className="w-full h-1/2 relative"
                    style={{ backgroundColor: dispensedBall.topColor }}
                  >
                    <div className="absolute top-1 left-1.5 w-3 h-1.5 bg-white/40 rounded-full" />
                  </div>
                  {/* Divider line */}
                  <div className="w-full h-0.5 bg-gray-400" />
                  {/* Bottom half */}
                  <div
                    className="w-full h-1/2"
                    style={{ backgroundColor: dispensedBall.bottomColor }}
                  />
                </div>
              )}
            </div>

            {/* 右側日式警告貼紙與退幣槽 */}
            <div className="flex flex-col justify-between items-end pl-1.5">
              <div className="w-16 sm:w-18 bg-[#fef3c7] border border-[#f59e0b] text-[#92400e] text-[7px] p-1 rounded-sm leading-tight text-left">
                <span className="font-bold block text-center border-b border-[#f59e0b]/40 pb-0.5 mb-0.5">
                  ▲ 注意 (ちゅうい)
                </span>
                <span className="block text-[6px] text-[#b45309] leading-tight">
                  ● 取出口のすきまに指を入れないでください。
                </span>
              </div>

              {/* 退幣槽 */}
              <div className="w-9 h-10 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center shadow-inner">
                <div className="w-3 h-5 bg-gray-400 rounded-xs" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
