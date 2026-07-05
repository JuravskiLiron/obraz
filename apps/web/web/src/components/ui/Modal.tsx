import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { CloseIcon } from "./icons";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: Props) {
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

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 animate-fade-in bg-black/45"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-bg p-6 shadow-xl animate-fade-in sm:max-w-lg sm:rounded-token",
          className,
        )}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{title}</h2>
            <button
              aria-label="Close"
              onClick={onClose}
              className="-mr-1 p-1 hover:text-muted"
            >
              <CloseIcon />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}
