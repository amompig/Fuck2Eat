import React, { useEffect } from 'react';
import { Restaurant } from '../types';
import {
  X,
  MapPin,
  Clock,
  DollarSign,
  Phone,
  MessageSquareQuote,
  ExternalLink,
  RotateCcw,
  Building,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface WinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  onRedraw: () => void;
  respinCount: number;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onRedraw,
  respinCount,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !restaurant) return null;

  const queryTarget = `${restaurant.name} ${restaurant.address || '桃園市' + (restaurant.district || '')}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryTarget)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="扭蛋決定結果"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg bg-[var(--bg-card)] border-2 border-[var(--accent-border)] rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-base)] uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>扭蛋決定 · 你今天吃這個！</span>
            {respinCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] font-mono ml-1">
                第 {respinCount + 1} 抽
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉彈出視窗"
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Restaurant Name */}
        <div className="mb-4">
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] leading-tight tracking-tight">
            {restaurant.name}
          </h2>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {restaurant.district && (
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--accent-light)] text-[var(--accent-base)] border border-[var(--accent-border)]">
                <MapPin className="w-3.5 h-3.5" />
                {restaurant.district}
              </span>
            )}

            {restaurant.cuisine.slice(0, 3).map((c) => (
              <span
                key={c}
                className="text-xs px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]"
              >
                {c}
              </span>
            ))}

            <span className="text-[11px] px-2 py-0.5 rounded text-[var(--text-muted)] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              完整度: {restaurant.confidence === 'high' ? '高' : restaurant.confidence === 'med' ? '中' : '無'}
            </span>
          </div>
        </div>

        {/* ⭐ 必備：原清單策展者推薦註記 */}
        <div className="my-4 p-4 rounded-2xl bg-[var(--accent-light)] border-2 border-[var(--accent-border)]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent-base)] mb-1.5">
            <MessageSquareQuote className="w-4 h-4 shrink-0" />
            <span>原清單策展者推薦說：</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-relaxed">
            {restaurant.curator_note && restaurant.curator_note.trim()
              ? restaurant.curator_note
              : '（清單收藏無文字特記，在地人私藏美味）'}
          </p>
        </div>

        {/* Basic Facts: Hours, Price, Address */}
        <div className="space-y-2 my-4 text-xs sm:text-sm text-[var(--text-secondary)] bg-[var(--bg-card-subtle)] p-3.5 rounded-xl border border-[var(--border-subtle)]">
          {restaurant.hours_raw && (
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">營業時間：</span>
                <span>{restaurant.hours_raw}</span>
              </div>
            </div>
          )}

          {restaurant.price_raw && (
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">參考價格：</span>
                <span>{restaurant.price_raw}</span>
              </div>
            </div>
          )}

          {restaurant.address && (
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">地址：</span>
                <span>{restaurant.address}</span>
              </div>
            </div>
          )}

          {restaurant.phone && (
            <div className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-[var(--accent-base)] mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-[var(--text-primary)]">電話：</span>
                <a href={`tel:${restaurant.phone}`} className="hover:underline text-[var(--accent-base)] font-mono">
                  {restaurant.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Fact Sources list */}
        {restaurant.sources && restaurant.sources.length > 0 && (
          <div className="text-[11px] text-[var(--text-muted)] mb-4">
            <span>事實來源：</span>
            <span>{restaurant.sources.join(' · ')}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {/* Deep link to Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="touch-target py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Google Maps 導航 ↗</span>
          </a>

          {/* Instant Redraw Button */}
          <button
            type="button"
            onClick={onRedraw}
            className="touch-target py-3 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再扭一次 (換一家)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
