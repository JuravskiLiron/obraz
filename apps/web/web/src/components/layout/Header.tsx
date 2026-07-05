import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useCategoryTree } from "@/hooks/useCatalog";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { MegaMenu } from "./MegaMenu";
import {
  BagIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Gender } from "@/types/api";

function CountBubble({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Header() {
  const gender = useUiStore((s) => s.gender);
  const setGender = useUiStore((s) => s.setGender);
  const openDrawer = useUiStore((s) => s.openDrawer);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();

  const { data: cart } = useCart();
  const { data: wishlist } = useWishlist();
  const { data: tree } = useCategoryTree(gender);

  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchGender = (g: Exclude<Gender, "unisex">) => {
    setGender(g);
    setHovered(null);
    navigate(`/${g}`);
  };

  const openMega = (id: string | null) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setHovered(id);
  };
  const scheduleClose = () => {
    leaveTimer.current = setTimeout(() => setHovered(null), 120);
  };

  const activeNode = tree?.find((t) => t.id === hovered);
  const cartCount = cart?.count ?? 0;
  const wishCount = isAuthed ? (wishlist?.items.length ?? 0) : 0;

  return (
    <header
      className="sticky top-0 z-50 border-b border-line bg-bg"
      onMouseLeave={scheduleClose}
    >
      {/* ---- top bar ---- */}
      <div
        className={cn(
          "container-px flex items-center gap-3 transition-all duration-200",
          scrolled ? "h-14 lg:h-16" : "h-14 lg:h-20",
        )}
      >
        {/* mobile hamburger */}
        <button
          className="-ml-1 p-1 lg:hidden"
          aria-label="Open menu"
          onClick={() => openDrawer("menu")}
        >
          <MenuIcon />
        </button>

        {/* logo */}
        <Link
          to="/"
          className={cn(
            "font-display font-extrabold uppercase tracking-[0.12em] transition-all",
            scrolled ? "text-xl" : "text-xl lg:text-2xl",
          )}
        >
          obraz
        </Link>

        {/* gender switch (desktop) */}
        <div className="ml-3 hidden items-center gap-1 lg:flex">
          {(["women", "men"] as const).map((g) => (
            <button
              key={g}
              onClick={() => switchGender(g)}
              className={cn(
                "px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors",
                gender === g
                  ? "text-fg underline underline-offset-[6px]"
                  : "text-muted hover:text-fg",
              )}
            >
              {g}
            </button>
          ))}
        </div>

        {/* desktop search */}
        <div className="mx-4 hidden max-w-xl flex-1 lg:block">
          <SearchAutocomplete />
        </div>

        {/* actions */}
        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <button
            className="p-1.5 lg:hidden"
            aria-label="Search"
            onClick={() => openDrawer("search")}
          >
            <SearchIcon />
          </button>
          <Link
            to={isAuthed ? "/account" : "/login"}
            aria-label="Account"
            className="hidden p-1.5 lg:inline-flex"
          >
            <UserIcon />
          </Link>
          <Link
            to="/wishlist"
            aria-label="Saved items"
            className="relative hidden p-1.5 sm:inline-flex"
          >
            <HeartIcon />
            <CountBubble count={wishCount} />
          </Link>
          <button
            onClick={() => openDrawer("cart")}
            aria-label="Open bag"
            className="relative p-1.5"
          >
            <BagIcon />
            <CountBubble count={cartCount} />
          </button>
        </div>
      </div>

      {/* ---- desktop category nav ---- */}
      <nav className="hidden border-t border-line lg:block">
        <div className="container-px flex items-center gap-6">
          <Link
              to={`/${gender}`}
              onMouseEnter={() => openMega(null)}
              className="py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-fg"
          >
            All
          </Link>
          {tree?.map((top) => (
            <div
              key={top.id}
              onMouseEnter={() => openMega(top.id)}
              className="py-3"
            >
              <Link
                to={`/${gender}/${top.slug}`}
                className={cn(
                  "text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors",
                  hovered === top.id ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {top.name}
              </Link>
            </div>
          ))}
          <Link
            to={`/${gender}?isNew=true`}
            onMouseEnter={() => openMega(null as unknown as string)}
            className="py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted hover:text-fg"
          >
            New in
          </Link>
          <Link
            to={`/${gender}?onSale=true`}
            onMouseEnter={() => setHovered(null)}
            className="py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-sale hover:opacity-80"
          >
            Sale
          </Link>
        </div>

        {activeNode && activeNode.children.length > 0 && (
          <div
            className="absolute inset-x-0 top-full border-y border-line bg-bg shadow-md animate-fade-in"
            onMouseEnter={() => openMega(activeNode.id)}
          >
            <MegaMenu
              node={activeNode}
              gender={gender}
              onNavigate={() => setHovered(null)}
            />
          </div>
        )}
      </nav>
    </header>
  );
}
