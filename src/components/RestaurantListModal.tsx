import React, { useEffect } from 'react';
import { Restaurant } from '../types';
import { X, MapPin, Clock, DollarSign, MessageSquareQuote, ExternalLink } from 'lucide-react';

interface RestaurantListModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const RestaurantListModal: React.FC<RestaurantListModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  onSelectRestaurant,
}) => {
  // Listen for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="符合條件的店家列表"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl max-h-[88dvh] flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              自己挑選店家
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              目前符合硬條件的候選店家共 {restaurants.length} 間
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉列表"
            className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-subtle)] touch-target transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {restaurants.map((r) => {
            const hasCuratorNote = Boolean(r.curator_note && r.curator_note.trim());
            return (
              <div
                key={r.id}
                tabIndex={0}
                role="button"
                onClick={() => onSelectRestaurant(r)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRestaurant(r);
                  }
                }}
                className="virtual-card p-4 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-base)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer text-left focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] shadow-2xs group"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent-base)] transition-colors">
                      {r.name}
                    </h3>
                    {r.district && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] font-medium">
                        {r.district}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-[var(--accent-base)] font-medium">
                    <span>查看詳情</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Cuisine Tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {r.cuisine.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] px-2 py-0.2 rounded-md bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]"
                    >
                      {c}
                    </span>
                  ))}
                </div>

                {/* Hours & Price info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-secondary)] mb-2.5">
                  {r.hours_raw && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="truncate">{r.hours_raw}</span>
                    </div>
                  )}
                  {r.price_raw && (
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                      <span className="truncate">{r.price_raw}</span>
                    </div>
                  )}
                </div>

                {/* Curator note preview */}
                {hasCuratorNote && (
                  <div className="p-2.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-border)] text-xs text-[var(--accent-base)] flex items-start gap-2">
                    <MessageSquareQuote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2 font-medium">{r.curator_note}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-card-subtle)] text-right">
          <button
            type="button"
            onClick={onClose}
            className="touch-target px-4 py-2 rounded-lg border border-[var(--border-strong)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
