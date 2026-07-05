import type { Facets, ProductSort } from "@/types/api";
import { FacetGroup } from "./FacetGroup";
import { PriceRange } from "@/components/ui/PriceRange";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface FilterState {
  sizes: string[];
  colors: string[];
  brands: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale: boolean;
  isNew: boolean;
  sort: ProductSort;
}

export interface FilterHandlers {
  toggleArray: (key: "sizes" | "colors" | "brands", value: string) => void;
  setPrice: (lo: number, hi: number) => void;
  setBool: (key: "onSale" | "isNew", value: boolean) => void;
}

export function FilterSidebar({
  facets,
  state,
  handlers,
}: {
  facets: Facets;
  state: FilterState;
  handlers: FilterHandlers;
}) {
  const lo = state.minPrice ?? facets.minPrice;
  const hi = state.maxPrice ?? facets.maxPrice;

  return (
    <div>
      {/* Type toggles */}
      <FacetGroup title="Offers">
        <div className="space-y-2">
          <Check
            label="On sale"
            checked={state.onSale}
            onChange={(v) => handlers.setBool("onSale", v)}
          />
          <Check
            label="New in"
            checked={state.isNew}
            onChange={(v) => handlers.setBool("isNew", v)}
          />
        </div>
      </FacetGroup>

      {facets.sizes.length > 0 && (
        <FacetGroup title="Size">
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => {
              const active = state.sizes.includes(s.value);
              return (
                <button
                  key={s.value}
                  onClick={() => handlers.toggleArray("sizes", s.value)}
                  className={cn(
                    "min-w-10 border px-2.5 py-1.5 text-[13px] transition-colors",
                    active
                      ? "border-fg bg-fg text-bg"
                      : "border-line hover:border-fg",
                  )}
                >
                  {s.value}
                </button>
              );
            })}
          </div>
        </FacetGroup>
      )}

      {facets.colors.length > 0 && (
        <FacetGroup title="Colour">
          <div className="space-y-2">
            {facets.colors.map((c) => {
              const active = state.colors.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => handlers.toggleArray("colors", c.value)}
                  className="flex w-full items-center gap-2.5 text-left"
                >
                  <span
                    className={cn(
                      "h-5 w-5 rounded-full border border-line ring-offset-1",
                      active && "ring-2 ring-fg ring-offset-bg",
                    )}
                    style={{ backgroundColor: c.hex ?? "#ccc" }}
                  />
                  <span className="flex-1 text-[13px] capitalize">
                    {c.value}
                  </span>
                  <span className="text-[12px] text-subtle">{c.count}</span>
                </button>
              );
            })}
          </div>
        </FacetGroup>
      )}

      {facets.brands.length > 0 && (
        <FacetGroup title="Brand">
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {facets.brands.map((b) => (
              <Check
                key={b.value}
                label={b.value}
                count={b.count}
                checked={state.brands.includes(b.value)}
                onChange={() => handlers.toggleArray("brands", b.value)}
              />
            ))}
          </div>
        </FacetGroup>
      )}

      {facets.maxPrice > facets.minPrice && (
        <FacetGroup title="Price">
          <PriceRange
            min={facets.minPrice}
            max={facets.maxPrice}
            lo={lo}
            hi={hi}
            onChange={handlers.setPrice}
          />
        </FacetGroup>
      )}
    </div>
  );
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-2.5 text-left"
    >
      <span
        className={cn(
          "grid h-4.5 w-4.5 shrink-0 place-items-center border",
          checked ? "border-fg bg-fg text-bg" : "border-line",
        )}
        style={{ height: "1.125rem", width: "1.125rem" }}
      >
        {checked && <CheckIcon className="h-3 w-3" />}
      </span>
      <span className="flex-1 text-[13px] capitalize">{label}</span>
      {count != null && (
        <span className="text-[12px] text-subtle">{count}</span>
      )}
    </button>
  );
}
