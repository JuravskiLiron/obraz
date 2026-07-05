import { useState, type ReactNode } from "react";
import { ChevronDown } from "./icons";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  title: string;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen,
}: {
  items: Item[];
  defaultOpen?: string;
}) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it) => {
        const isOpen = open === it.id;
        return (
          <div key={it.id}>
            <button
              onClick={() => setOpen(isOpen ? null : it.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">
                {it.title}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen && (
              <div className="pb-5 text-sm leading-relaxed text-muted">
                {it.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
