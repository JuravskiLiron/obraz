import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "new" | "sale" | "low" | "neutral";

const tones: Record<Tone, string> = {
  new: "bg-fg text-bg",
  sale: "bg-sale text-white",
  low: "bg-bg text-fg border border-fg",
  neutral: "bg-surface text-muted",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
