import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ChevronRight } from "@/components/ui/icons";

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!user) return null;

  const logout = () => {
    signOut();
    qc.clear();
    navigate("/");
  };

  const links = [
    { to: "/account/orders", label: "My orders", desc: "Track and view your orders" },
    { to: "/wishlist", label: "Saved items", desc: "Items you’ve saved for later" },
  ];

  return (
    <div className="container-px py-8">
      <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight">
        My account
      </h1>
      <p className="mt-1 text-sm text-muted">
        {user.firstName} {user.lastName} · {user.email}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="flex items-center justify-between border border-line p-5 transition-colors hover:border-fg"
          >
            <span>
              <span className="block font-display text-base font-bold uppercase tracking-wide">
                {l.label}
              </span>
              <span className="mt-0.5 block text-[13px] text-muted">
                {l.desc}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 text-muted" />
          </Link>
        ))}
      </div>

      {user.addresses.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 font-display text-base font-bold uppercase tracking-wide">
            Saved addresses
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {user.addresses.map((a, i) => (
              <div key={i} className="border border-line p-4 text-sm">
                <p className="font-medium">{a.fullName}</p>
                <p className="mt-1 text-muted">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {a.city}, {a.postalCode}
                  <br />
                  {a.country}
                </p>
                {a.isDefault && (
                  <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10">
        <Button variant="outline" onClick={logout}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
