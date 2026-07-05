import type { ColorDto } from "@/types/api";
import { cn } from "@/lib/utils";

interface Props {
  colors: ColorDto[];
  selected: number;
  onSelect: (index: number) => void;
  size?: "sm" | "md";
  max?: number;
}

export function ColorSwatches({
  colors,
  selected,
  onSelect,
  size = "sm",
  max,
}: Props) {
  const shown = max ? colors.slice(0, max) : colors;
  const dim = size === "sm" ? "h-4 w-4" : "h-7 w-7";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((c, i) => (
        <button
          key={c.name + i}
          type="button"
          title={c.name}
          aria-label={c.name}
          aria-pressed={selected === i}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(i);
          }}
          className={cn(
            "rounded-full border border-line ring-offset-1 transition",
            dim,
            selected === i && "ring-2 ring-fg ring-offset-bg",
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
      {max && colors.length > max && (
        <span className="text-[11px] text-muted">+{colors.length - max}</span>
      )}
    </div>
  );
}
