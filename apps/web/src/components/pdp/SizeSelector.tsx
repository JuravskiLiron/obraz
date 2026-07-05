import { cn } from "@/lib/utils";

export function SizeSelector({
  sizes,
  selected,
  disabled,
  onSelect,
  onOpenGuide,
}: {
  sizes: string[];
  selected: string | null;
  disabled: string[];
  onSelect: (s: string) => void;
  onOpenGuide: () => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">
          Size
        </span>
        <button
          onClick={onOpenGuide}
          className="text-[12px] text-muted underline hover:text-fg"
        >
          Size guide
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {sizes.map((s) => {
          const isOut = disabled.includes(s);
          const isActive = selected === s;
          return (
            <button
              key={s}
              disabled={isOut}
              onClick={() => onSelect(s)}
              className={cn(
                "h-11 border text-[13px] transition-colors",
                isActive
                  ? "border-fg bg-fg text-bg"
                  : "border-line hover:border-fg",
                isOut &&
                  "cursor-not-allowed border-line text-subtle line-through hover:border-line",
              )}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
