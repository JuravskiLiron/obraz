import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CloseIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  side?: "right" | "left" | "bottom";
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Footer pinned to the bottom of the panel (e.g. cart subtotal + checkout). */
  footer?: ReactNode;
}

export function Drawer({
  open,
  onClose,
  side = "right",
  title,
  children,
  className,
  footer,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const panelPos =
    side === "right"
      ? "right-0 top-0 h-full w-full max-w-md animate-slide-in-right"
      : side === "left"
        ? "left-0 top-0 h-full w-[88%] max-w-sm animate-slide-in-left"
        : "bottom-0 left-0 w-full max-h-[88vh] rounded-t-2xl";

  return createPortal(
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 animate-fade-in bg-black/40"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute flex flex-col bg-bg shadow-xl",
          panelPos,
          className,
        )}
      >
        {(title || side) && (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-bold uppercase tracking-wide">
              {title}
            </h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="-mr-1 p-1 text-fg hover:text-muted"
            >
              <CloseIcon />
            </button>
          </div>
        )}
        <div className="no-scrollbar flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="border-t border-line">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
