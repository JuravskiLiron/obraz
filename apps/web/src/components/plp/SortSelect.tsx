import type { ProductSort } from "@/types/api";
import { ChevronDown } from "@/components/ui/icons";

const options: { value: ProductSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "newIn", label: "New in" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: ProductSort;
  onChange: (s: ProductSort) => void;
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        aria-label="Sort by"
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSort)}
        className="appearance-none border border-line bg-bg py-2 pl-3 pr-9 text-[13px] font-medium outline-none focus-visible:ring-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4" />
    </div>
  );
}
