import React, { useState, useRef, useEffect } from 'react';
import { SimulationTime } from '../types';
import { Clock, RotateCcw } from 'lucide-react';

interface TimeWidgetProps {
  simTime: SimulationTime;
  onSetSimulationTime: (sim: SimulationTime) => void;
}

const DAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

export const TimeWidget: React.FC<TimeWidgetProps> = ({
  simTime,
  onSetSimulationTime,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeFormatted = `${DAYS[simTime.day]} ${pad(simTime.hour)}:${pad(simTime.minute)}`;

  // Close flyout on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const setRealTime = () => {
    const now = new Date();
    onSetSimulationTime({
      isSimulated: false,
      day: now.getDay(),
      hour: now.getHours(),
      minute: now.getMinutes(),
    });
    setIsOpen(false);
  };

  const setNoonDemo = () => {
    onSetSimulationTime({
      isSimulated: true,
      day: 3,
      hour: 12,
      minute: 30,
    });
    setIsOpen(false);
  };

  const setMidnightDemo = () => {
    onSetSimulationTime({
      isSimulated: true,
      day: 5,
      hour: 1,
      minute: 0,
    });
    setIsOpen(false);
  };

  return (
    <div ref={widgetRef} className="relative select-none shrink-0 flex flex-col items-center">
      {/* Time Display Badge on the Right */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="調整營業判定時間"
        className="touch-target flex flex-col items-center justify-center p-2.5 sm:p-3 bg-[var(--bg-card)]/95 backdrop-blur-md border border-[var(--border-strong)] rounded-2xl shadow-md hover:border-[var(--accent-base)] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-1.5 text-[var(--accent-base)] mb-0.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            {simTime.isSimulated ? '模擬' : '現在'}
          </span>
        </div>
        <div className="font-mono font-bold text-xs sm:text-sm text-[var(--text-primary)]">
          {timeFormatted}
        </div>
      </button>

      {/* Flyout popup opening cleanly inward/leftward from the right side */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 sm:right-full sm:mr-2 sm:top-0 z-50 w-38 bg-[var(--bg-card)] border border-[var(--border-strong)] rounded-xl shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] font-bold text-[var(--text-muted)] px-1.5 py-0.5">
            時間設定
          </div>
          <button
            type="button"
            onClick={setRealTime}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between ${
              !simTime.isSimulated
                ? 'bg-[var(--accent-light)] text-[var(--accent-base)]'
                : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            <span>當前時間</span>
            <RotateCcw className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={setNoonDemo}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold ${
              simTime.isSimulated && simTime.hour === 12
                ? 'bg-[var(--accent-light)] text-[var(--accent-base)]'
                : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            週三午餐 12:30
          </button>
          <button
            type="button"
            onClick={setMidnightDemo}
            className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold ${
              simTime.isSimulated && simTime.hour === 1
                ? 'bg-[var(--accent-light)] text-[var(--accent-base)]'
                : 'hover:bg-[var(--bg-card-subtle)] text-[var(--text-secondary)]'
            }`}
          >
            週五宵夜 01:00
          </button>
        </div>
      )}
    </div>
  );
};
