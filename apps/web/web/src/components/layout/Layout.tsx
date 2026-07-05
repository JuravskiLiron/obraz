import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileMenu } from "./MobileMenu";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { Toaster } from "@/components/ui/Toaster";
import { useUiStore } from "@/store/uiStore";
import { useSyncUser } from "@/hooks/useAuth";
import { CloseIcon } from "@/components/ui/icons";

function SearchSheet() {
  const drawer = useUiStore((s) => s.drawer);
  const close = useUiStore((s) => s.closeDrawer);
  if (drawer !== "search") return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={close} />
      <div className="absolute inset-x-0 top-0 animate-fade-in bg-bg p-4 shadow-lg">
        <div className="mb-2 flex items-center justify-between">
          <span className="eyebrow text-muted">Search</span>
          <button aria-label="Close search" onClick={close} className="p-1">
            <CloseIcon />
          </button>
        </div>
        <SearchAutocomplete autoFocus onNavigate={close} />
      </div>
    </div>
  );
}

export function Layout() {
  // Keep the persisted user in sync with the server on load.
  useSyncUser();
  return (
    <div className="flex min-h-screen flex-col">
        <ScrollRestoration />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <MobileMenu />
      <SearchSheet />
      <Toaster />
    </div>
  );
}
