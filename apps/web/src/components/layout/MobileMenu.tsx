import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Drawer } from "@/components/ui/Drawer";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useCategoryTree } from "@/hooks/useCatalog";
import { ChevronDown } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Gender } from "@/types/api";



export function MobileMenu() {
  const drawer = useUiStore((s) => s.drawer);
  const close = useUiStore((s) => s.closeDrawer);
  const gender = useUiStore((s) => s.gender);
  const setGender = useUiStore((s) => s.setGender);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <Drawer open={drawer === "menu"} onClose={close} side="left" title="Menu">
      <div className="flex">
        {([
          { key: "all", label: "View all" },
          { key: "women", label: "Women" },
          { key: "men", label: "Men" },
        ] as const).map((t) => {
          const active =
            t.key === "all"
              ? pathname === "/" || pathname.startsWith("/all")
              : pathname.startsWith(`/${t.key}`);
          return (
            <button
              key={t.key}
              onClick={() => {
                if (t.key !== "all") setGender(t.key);
                close();
                navigate(t.key === "all" ? "/all" : `/${t.key}`);
              }}
              className={cn(
                "flex-1 border-b-2 py-3 text-sm font-semibold uppercase tracking-wide",
                active
                  ? "border-fg text-fg"
                  : "border-transparent text-muted",
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <MobileTree gender={gender} onNavigate={close} />

      <div className="border-t border-line px-5 py-4 text-sm">
        {isAuthed ? (
          <>
            <Link
              to="/account"
              onClick={close}
              className="block py-2 text-fg"
            >
              My account
            </Link>
            <Link
              to="/account/orders"
              onClick={close}
              className="block py-2 text-fg"
            >
              My orders
            </Link>
            <Link
              to="/wishlist"
              onClick={close}
              className="block py-2 text-fg"
            >
              Saved items
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" onClick={close} className="block py-2 text-fg">
              Sign in
            </Link>
            <Link
              to="/register"
              onClick={close}
              className="block py-2 text-fg"
            >
              Join
            </Link>
          </>
        )}
      </div>
    </Drawer>
  );
}

function MobileTree({
  gender,
  onNavigate,
}: {
  gender: Gender;
  onNavigate: () => void;
}) {
  const { data } = useCategoryTree(gender);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <nav className="px-2 py-2">
      <Link
        to={`/${gender}?onSale=true`}
        onClick={onNavigate}
        className="block px-3 py-3 text-sm font-semibold uppercase tracking-wide text-sale"
      >
        Sale
      </Link>
      {data?.map((top) => {
        const isOpen = open === top.id;
        const hasChildren = top.children.length > 0;
        return (
          <div key={top.id} className="border-t border-line">
            <button
              onClick={() =>
                hasChildren ? setOpen(isOpen ? null : top.id) : undefined
              }
              className="flex w-full items-center justify-between px-3 py-3"
            >
              {hasChildren ? (
                <span className="text-sm font-semibold uppercase tracking-wide">
                  {top.name}
                </span>
              ) : (
                <Link
                  to={`/${gender}/${top.slug}`}
                  onClick={onNavigate}
                  className="text-sm font-semibold uppercase tracking-wide"
                >
                  {top.name}
                </Link>
              )}
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </button>
            {isOpen && hasChildren && (
              <div className="pb-2">
                <Link
                  to={`/${gender}/${top.slug}`}
                  onClick={onNavigate}
                  className="block px-6 py-2 text-sm text-fg"
                >
                  Shop all {top.name}
                </Link>
                {top.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/${gender}/${child.slug}`}
                    onClick={onNavigate}
                    className="block px-6 py-2 text-sm text-muted"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
