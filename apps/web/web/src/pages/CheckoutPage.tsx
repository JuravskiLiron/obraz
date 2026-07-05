import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useOrders";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { Field } from "./LoginPage";
import { formatPrice, cn } from "@/lib/utils";
import type { DeliveryMethod, ShippingAddress } from "@/types/api";

const methods: {
  id: DeliveryMethod;
  label: string;
  desc: string;
  price: (subtotal: number) => number;
}[] = [
  {
    id: "standard",
    label: "Standard delivery",
    desc: "3–5 working days",
    price: (s) => (s >= 75 ? 0 : 4.99),
  },
  {
    id: "express",
    label: "Express delivery",
    desc: "1–2 working days",
    price: () => 9.99,
  },
  {
    id: "pickupPoint",
    label: "Pickup point",
    desc: "Collect from a local point",
    price: () => 2.99,
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const { data: cart, isLoading } = useCart();
  const checkout = useCheckout();
  const pushToast = useToastStore((s) => s.push);

  const [method, setMethod] = useState<DeliveryMethod>("standard");
  const def = user?.addresses?.find((a) => a.isDefault) ?? user?.addresses?.[0];
  const [addr, setAddr] = useState<ShippingAddress>({
    fullName: def ? def.fullName : user ? `${user.firstName} ${user.lastName}` : "",
    line1: def?.line1 ?? "",
    line2: def?.line2 ?? "",
    city: def?.city ?? "",
    postalCode: def?.postalCode ?? "",
    country: def?.country ?? "",
    phone: def?.phone ?? "",
  });

  useEffect(() => {
    if (!isAuthed) navigate("/login?redirect=/checkout", { replace: true });
  }, [isAuthed, navigate]);

  useEffect(() => {
    if (!isLoading && cart && cart.items.length === 0)
      navigate("/cart", { replace: true });
  }, [isLoading, cart, navigate]);

  if (!cart || cart.items.length === 0) return null;

  const subtotal = cart.subtotal;
  const shipping = methods.find((m) => m.id === method)!.price(subtotal);
  const total = subtotal + shipping;

  const set = (k: keyof ShippingAddress) => (v: string) =>
    setAddr((a) => ({ ...a, [k]: v }));

  const placeOrder = (e: FormEvent) => {
    e.preventDefault();
    checkout.mutate(
      { shippingAddress: addr, deliveryMethod: method },
      {
        onSuccess: (order) => {
          pushToast(`Order ${order.orderNumber} placed`, "success");
          navigate(`/account/orders/${order.id}`, { replace: true });
        },
        onError: (err) =>
          pushToast(
            err instanceof Error ? err.message : "Could not place order",
            "error",
          ),
      },
    );
  };

  return (
    <div className="container-px py-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold uppercase tracking-tight">
        Checkout
      </h1>

      <form
        onSubmit={placeOrder}
        className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-10">
          {/* Delivery */}
          <section>
            <h2 className="mb-4 font-display text-base font-bold uppercase tracking-wide">
              Delivery method
            </h2>
            <div className="space-y-2">
              {methods.map((m) => {
                const p = m.price(subtotal);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex w-full items-center justify-between border p-4 text-left transition-colors",
                      method === m.id ? "border-fg" : "border-line hover:border-fg/50",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "grid h-4 w-4 place-items-center rounded-full border",
                          method === m.id ? "border-fg" : "border-line",
                        )}
                      >
                        {method === m.id && (
                          <span className="h-2 w-2 rounded-full bg-fg" />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">
                          {m.label}
                        </span>
                        <span className="block text-[12px] text-muted">
                          {m.desc}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {p === 0 ? "Free" : formatPrice(p, "USD")}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Address */}
          <section>
            <h2 className="mb-4 font-display text-base font-bold uppercase tracking-wide">
              Shipping address
            </h2>
            <div className="space-y-4">
              <Field label="Full name" value={addr.fullName} onChange={set("fullName")} autoComplete="name" />
              <Field label="Address line 1" value={addr.line1} onChange={set("line1")} autoComplete="address-line1" />
              <Field label="Address line 2 (optional)" value={addr.line2} onChange={set("line2")} autoComplete="address-line2" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" value={addr.city} onChange={set("city")} autoComplete="address-level2" />
                <Field label="Postal code" value={addr.postalCode} onChange={set("postalCode")} autoComplete="postal-code" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country" value={addr.country} onChange={set("country")} autoComplete="country-name" />
                <Field label="Phone" value={addr.phone} onChange={set("phone")} autoComplete="tel" />
              </div>
            </div>
          </section>

          {/* Payment (mock) */}
          <section>
            <h2 className="mb-4 font-display text-base font-bold uppercase tracking-wide">
              Payment
            </h2>
            <div className="border border-line p-4">
              <p className="mb-3 text-[12px] text-muted">
                Demo checkout — no real payment is taken.
              </p>
              <div className="space-y-3">
                <Field label="Card number" value="4242 4242 4242 4242" onChange={() => {}} />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry" value="12 / 28" onChange={() => {}} />
                  <Field label="CVC" value="123" onChange={() => {}} />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line p-5">
            <h2 className="mb-4 font-display text-base font-bold uppercase tracking-wide">
              Your order ({cart.count})
            </h2>
            <div className="no-scrollbar max-h-64 space-y-3 overflow-y-auto">
              {cart.items.map((it) => (
                <div key={it.sku} className="flex gap-3">
                  <img
                    src={it.image}
                    alt=""
                    className="h-16 w-12 shrink-0 bg-surface object-cover"
                  />
                  <div className="min-w-0 flex-1 text-[12px]">
                    <p className="truncate font-medium">{it.name}</p>
                    <p className="text-muted">
                      {it.color} · {it.size} · Qty {it.qty}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold">
                    {formatPrice(it.price * it.qty, "USD")}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(subtotal, "USD")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping, "USD")}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <span>Total</span>
                <span className="font-display text-lg font-bold">
                  {formatPrice(total, "USD")}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              className="mt-5"
              loading={checkout.isPending}
            >
              Place order
            </Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
