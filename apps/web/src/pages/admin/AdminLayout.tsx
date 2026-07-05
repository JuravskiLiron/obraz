import { NavLink, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";

export function AdminLayout() {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthed || !isAdmin)
    return (
      <EmptyState
        title="Not authorized"
        description="You need an admin account to view this area."
      />
    );

  const tabs = [
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="container-px py-8">
      <h1 className="mb-5 font-display text-2xl font-extrabold uppercase tracking-tight">
        Admin
      </h1>
      <nav className="mb-8 flex gap-1 border-b border-line">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                "border-b-2 px-4 py-2.5 text-[13px] font-semibold uppercase tracking-wide",
                isActive
                  ? "border-fg text-fg"
                  : "border-transparent text-muted hover:text-fg",
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
