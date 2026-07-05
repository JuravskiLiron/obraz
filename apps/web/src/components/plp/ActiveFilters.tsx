import type { FilterState } from "./FilterSidebar";
import { CloseIcon } from "@/components/ui/icons";
import { formatPrice } from "@/lib/utils";

interface Chip {
  key: string;
  label: string;
  onRemove: () => void;
}

export function ActiveFilters({
  state,
  handlers,
  onClearAll,
  priceBounds,
}: {
  state: FilterState;
  handlers: {
    toggleArray: (key: "sizes" | "colors" | "brands", value: string) => void;
    setBool: (key: "onSale" | "isNew", value: boolean) => void;
    clearPrice: () => void;
  };
  onClearAll: () => void;
  priceBounds: { min: number; max: number };
}) {
  const chips: Chip[] = [];

  if (state.onSale)
    chips.push({
      key: "onSale",
      label: "On sale",
      onRemove: () => handlers.setBool("onSale", false),
    });
  if (state.isNew)
    chips.push({
      key: "isNew",
      label: "New in",
      onRemove: () => handlers.setBool("isNew", false),
    });
  for (const v of state.sizes)
    chips.push({
      key: `size-${v}`,
      label: `Size ${v}`,
      onRemove: () => handlers.toggleArray("sizes", v),
    });
  for (const v of state.colors)
    chips.push({
      key: `color-${v}`,
      label: v,
      onRemove: () => handlers.toggleArray("colors", v),
    });
  for (const v of state.brands)
    chips.push({
      key: `brand-${v}`,
      label: v,
      onRemove: () => handlers.toggleArray("brands", v),
    });
  if (state.minPrice != null || state.maxPrice != null)
    chips.push({
      key: "price",
      label: `${formatPrice(state.minPrice ?? priceBounds.min, "USD")} – ${formatPrice(
        state.maxPrice ?? priceBounds.max,
        "USD",
      )}`,
      onRemove: handlers.clearPrice,
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          onClick={c.onRemove}
          className="inline-flex items-center gap-1.5 border border-line bg-surface px-2.5 py-1 text-[12px] capitalize hover:border-fg"
        >
          {c.label}
          <CloseIcon className="h-3 w-3" />
        </button>
      ))}
      <button
        onClick={onClearAll}
        className="text-[12px] font-semibold uppercase tracking-wide text-muted underline hover:text-fg"
      >
        Clear all
      </button>
    </div>
  );
}
