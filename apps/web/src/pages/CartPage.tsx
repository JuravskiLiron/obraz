import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/hooks/useCart";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { formatPrice } from "@/lib/utils";

export function CartPage() {
  const { data: cart, isLoading } = useCart();
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );

  if (!cart || cart.items.length === 0)
    return (
      <EmptyState
        title="Your bag is empty"
        description="Items added to your bag will appear here."
        action={
          <Button onClick={() => navigate("/")}>Start shopping</Button>
        }
      />
    );

  const estShipping = cart.subtotal >= 75 ? 0 : 4.99;

  return (
    <div className="container-px py-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold uppercase tracking-tight">
        My bag ({cart.count})
      </h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-line border-y border-line">
          {cart.items.map((item) => (
            <CartLineItem key={item.sku} item={item} />
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-line p-5">
            <h2 className="mb-4 font-display text-base font-bold uppercase tracking-wide">
              Order summary
            </h2>
            <div className="space-y-2.5 text-sm">
              <Row label="Subtotal" value={formatPrice(cart.subtotal, "USD")} />
              <Row
                label="Estimated delivery"
                value={estShipping === 0 ? "Free" : formatPrice(estShipping, "USD")}
              />
              <div className="my-3 border-t border-line" />
              <Row
                label="Estimated total"
                value={formatPrice(cart.subtotal + estShipping, "USD")}
                bold
              />
            </div>
            {cart.subtotal < 75 && (
              <p className="mt-3 text-[12px] text-muted">
                Spend {formatPrice(75 - cart.subtotal, "USD")} more for free
                standard delivery.
              </p>
            )}
            <Button fullWidth className="mt-5" onClick={() => navigate("/checkout")}>
              Checkout
            </Button>
            <Link
              to="/"
              className="mt-3 block text-center text-[13px] text-muted underline hover:text-fg"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "font-semibold" : "text-muted"}>{label}</span>
      <span className={bold ? "font-display text-base font-bold" : ""}>
        {value}
      </span>
    </div>
  );
}
