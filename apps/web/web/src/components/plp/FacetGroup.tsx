import { useState, type ReactNode } from "react";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function FacetGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between"
      >
        <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">
          {title}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
