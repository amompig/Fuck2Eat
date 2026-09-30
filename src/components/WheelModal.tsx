import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '../types';
import { getCryptoRandom } from '../utils/random';
import { X, Dices, Sparkles, RotateCcw } from 'lucide-react';

interface WheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  eligibleRestaurants: Restaurant[];
  isWeighted: boolean;
  onSelectResult: (restaurant: Restaurant, mode: 'fair_spin' | 'weighted_spin') => void;
}

export const WheelModal: React.FC<WheelModalProps> = ({
  isOpen,
  onClose,
  eligibleRestaurants,
  isWeighted,
  onSelectResult,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const timeoutRef = useRef<number | null>(null);

  // Check if system prefers reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Determine wheel slices (up to 12 slices)
  const maxSlices = 12;
  const isTooMany = eligibleRestaurants.length > maxSlices;
  const sliceRestaurants = isTooMany
    ? eligibleRestaurants.slice(0, 11)
    : eligibleRestaurants;

  const totalSlices = isTooMany ? 12 : sliceRestaurants.length;
  const sliceAngle = 360 / Math.max(totalSlices, 1);

  // Trigger spin on open
  useEffect(() => {
    if (isOpen && eligibleRestaurants.length > 0) {
      handleSpin();
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen]);

  const handleSpin = () => {
    if (spinning || eligibleRestaurants.length === 0) return;

    // Pick winning item
    let winner: Restaurant;
    let targetSliceIndex = 0;

    if (isWeighted) {
      // Weighted selection
      const weights = eligibleRestaurants.map((r) => (r.confidence === 'high' ? 3 : r.confidence === 'med' ? 2 : 1));
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
      // Fair selection
      const randIndex = Math.floor(getCryptoRandom() * eligibleRestaurants.length);
      winner = eligibleRestaurants[randIndex];
    }

    // Determine slice index on wheel
    const foundSliceIndex = sliceRestaurants.findIndex((r) => r.id === winner.id);
    if (foundSliceIndex !== -1) {
      targetSliceIndex = foundSliceIndex;
    } else {
      // It fell into "其他" slice (the last slice index)
      targetSliceIndex = totalSlices - 1;
    }

    if (prefersReducedMotion) {
      // Instant announcement, no spin
      setLiveAnnouncement(`抽選完畢：${winner.name}`);
      onSelectResult(winner, isWeighted ? 'weighted_spin' : 'fair_spin');
      return;
    }

    setSpinning(true);
    setLiveAnnouncement('轉盤旋轉中...');

    // The arrow is at top (270deg or 90deg depending on coordinates).
    // Let pointer be at the very top (0 deg).
    // Angle of slice i is [i * sliceAngle, (i + 1) * sliceAngle].
    // Center of slice i is (i + 0.5) * sliceAngle.
    // To align slice center with top (0deg):
    // Rotation = (full rotations * 360) + (360 - centerAngle)
    const extraRounds = 5 + Math.floor(getCryptoRandom() * 3); // 5 to 7 full rounds
    const sliceCenterAngle = (targetSliceIndex + 0.5) * sliceAngle;
    const targetAngle = extraRounds * 360 + (360 - sliceCenterAngle);

    setRotationDeg(targetAngle);

    timeoutRef.current = window.setTimeout(() => {
      setSpinning(false);
      setLiveAnnouncement(`抽選結果：今天就吃 ${winner.name}`);
      onSelectResult(winner, isWeighted ? 'weighted_spin' : 'fair_spin');
    }, 2850);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="命運轉盤抽選"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={spinning}
          aria-label="關閉轉盤"
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] touch-target transition-colors disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-1.5 bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]">
            {isWeighted ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-base)]" />
                <span>已加權抽選模式（資料完整度優先）</span>
              </>
            ) : (
              <>
                <Dices className="w-3.5 h-3.5 text-[var(--accent-base)]" />
                <span>真均勻公平抽模式（機率完全相同）</span>
              </>
            )}
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {spinning ? '命運轉盤旋轉中...' : '決定你等等吃什麼！'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            合格候選共 {eligibleRestaurants.length} 間店家
          </p>
        </div>

        {/* Accessible live region */}
        <div aria-live="polite" className="sr-only">
          {liveAnnouncement}
        </div>

        {/* Visual Wheel Container (aria-hidden="true" for screen readers) */}
        <div aria-hidden="true" className="relative w-64 h-64 mx-auto my-4">
          {/* Top Pointer Needle */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-16 border-t-[var(--accent-base)] filter drop-shadow-md" />

          {/* SVG Wheel */}
          <svg
            viewBox="-100 -100 200 200"
            className="w-full h-full rounded-full border-4 border-[var(--border-strong)] shadow-inner"
            style={{
              transform: `rotate(${rotationDeg}deg)`,
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 2.8s cubic-bezier(0.17, 0.67, 0.16, 1)',
            }}
          >
            <circle cx="0" cy="0" r="98" fill="var(--bg-card-subtle)" />
            {Array.from({ length: totalSlices }).map((_, i) => {
              const startAngle = (i * sliceAngle * Math.PI) / 180;
              const endAngle = ((i + 1) * sliceAngle * Math.PI) / 180;
              const x1 = Math.cos(startAngle) * 96;
              const y1 = Math.sin(startAngle) * 96;
              const x2 = Math.cos(endAngle) * 96;
              const y2 = Math.sin(endAngle) * 96;
              const largeArcFlag = sliceAngle > 180 ? 1 : 0;

              const isOtherSlice = isTooMany && i === totalSlices - 1;
              const shopName = isOtherSlice
                ? `其他(${eligibleRestaurants.length - 11})`
                : sliceRestaurants[i]?.name || '';

              // Alternating subtle pastel fills
              const fillColors = [
                'oklch(0.93 0.03 50)',
                'oklch(0.90 0.04 70)',
                'oklch(0.92 0.03 95)',
                'oklch(0.89 0.04 140)',
                'oklch(0.91 0.03 180)',
                'oklch(0.90 0.04 220)',
              ];
              const sliceFill = isOtherSlice
                ? 'oklch(0.82 0.03 260)'
                : fillColors[i % fillColors.length];

              const midAngleDeg = (i + 0.5) * sliceAngle;

              return (
                <g key={i}>
                  <path
                    d={`M 0 0 L ${x1} ${y1} A 96 96 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={sliceFill}
                    stroke="var(--bg-card)"
                    strokeWidth="1.5"
                  />
                  {/* Slice Text */}
                  <g transform={`rotate(${midAngleDeg}) translate(48, 0)`}>
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="oklch(0.20 0.02 260)"
                      fontSize={totalSlices > 8 ? '7' : '9'}
                      fontWeight="600"
                      className="select-none"
                    >
                      {shopName.length > 7 ? `${shopName.slice(0, 6)}…` : shopName}
                    </text>
                  </g>
                </g>
              );
            })}
            {/* Center Pin */}
            <circle cx="0" cy="0" r="14" fill="var(--bg-card)" stroke="var(--border-strong)" strokeWidth="2" />
            <circle cx="0" cy="0" r="6" fill="var(--accent-base)" />
          </svg>
        </div>

        {/* Action button */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleSpin}
            disabled={spinning}
            className="touch-target px-5 py-2.5 rounded-xl bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-card)] font-bold text-sm transition-opacity flex items-center gap-2 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            {spinning ? '抽取中...' : '再轉一次'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={spinning}
            className="touch-target px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-subtle)] text-sm font-medium transition-colors"
          >
            返回條件
          </button>
        </div>
      </div>
    </div>
  );
};
