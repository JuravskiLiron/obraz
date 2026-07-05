import { createPortal } from "react-dom";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { CheckIcon, CloseIcon } from "./icons";

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-token px-4 py-3 text-sm shadow-lg animate-fade-in",
            t.variant === "error"
              ? "bg-sale text-white"
              : "bg-fg text-bg",
          )}
        >
          {t.variant === "success" && <CheckIcon className="h-4 w-4 shrink-0" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
            <CloseIcon className="h-4 w-4 opacity-70" />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
}
