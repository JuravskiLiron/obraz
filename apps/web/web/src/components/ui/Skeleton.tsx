import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "shimmer relative overflow-hidden bg-surface",
        className,
      )}
    />
  );
}
