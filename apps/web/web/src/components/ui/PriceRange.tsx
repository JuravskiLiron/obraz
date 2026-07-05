import { useCallback } from "react";
import { formatPrice } from "@/lib/utils";

interface Props {
  min: number;
  max: number;
  lo: number;
  hi: number;
  step?: number;
  currency?: string;
  onChange: (lo: number, hi: number) => void;
}

/**
 * Two overlaid range inputs sharing one track. Thumbs stay independently
 * draggable; the active segment between them is highlighted.
 */
export function PriceRange({
  min,
  max,
  lo,
  hi,
  step = 1,
  currency = "USD",
  onChange,
}: Props) {
  const range = Math.max(max - min, 1);
  const loPct = ((lo - min) / range) * 100;
  const hiPct = ((hi - min) / range) * 100;

  const setLo = useCallback(
    (v: number) => onChange(Math.min(v, hi - step), hi),
    [hi, step, onChange],
  );
  const setHi = useCallback(
    (v: number) => onChange(lo, Math.max(v, lo + step)),
    [lo, step, onChange],
  );

  return (
    <div className="pt-1">
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-line" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-fg"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          className="range-thumb pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          className="range-thumb pointer-events-none absolute inset-0 h-6 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-[13px] text-muted">
        <span>{formatPrice(lo, currency)}</span>
        <span>{formatPrice(hi, currency)}</span>
      </div>
      <style>{`
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          height: 16px; width: 16px; border-radius: 9999px;
          background: rgb(var(--c-bg)); border: 2px solid rgb(var(--c-fg));
          cursor: pointer; box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          height: 16px; width: 16px; border-radius: 9999px;
          background: rgb(var(--c-bg)); border: 2px solid rgb(var(--c-fg));
          cursor: pointer;
        }
        .range-thumb::-webkit-slider-runnable-track { background: transparent; }
        .range-thumb::-moz-range-track { background: transparent; }
      `}</style>
    </div>
  );
}
