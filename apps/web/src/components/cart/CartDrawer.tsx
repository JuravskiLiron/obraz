import { useNavigate } from "react-router-dom";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useUiStore } from "@/store/uiStore";
import { useCart } from "@/hooks/useCart";
import { CartLineItem } from "./CartLineItem";
import { formatPrice } from "@/lib/utils";
import { BagIcon } from "@/components/ui/icons";

export function CartDrawer() {
  const drawer = useUiStore((s) => s.drawer);
  const close = useUiStore((s) => s.closeDrawer);
  const { data: cart, isLoading } = useCart();
  const navigate = useNavigate();

  const go = (path: string) => {
    close();
    navigate(path);
  };

  const isEmpty = !isLoading && (!cart || cart.items.length === 0);

  return (
    <Drawer
      open={drawer === "cart"}
      onClose={close}
      side="right"
      title={`My bag${cart?.count ? ` (${cart.count})` : ""}`}
      footer={
        cart && cart.items.length > 0 ? (
          <div className="space-y-3 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-lg font-bold">
                {formatPrice(cart.subtotal, "USD")}
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Shipping calculated at checkout.
            </p>
            <Button fullWidth onClick={() => go("/checkout")}>
              Checkout
            </Button>
            <Button
              variant="outline"
              fullWidth
              size="sm"
              onClick={() => go("/cart")}
            >
              View bag
            </Button>
          </div>
        ) : null
      }
    >
      {isLoading && (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      )}

      {isEmpty && (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <BagIcon className="h-10 w-10 text-subtle" />
          <p className="mt-4 font-display text-lg font-bold">Your bag is empty</p>
          <p className="mt-1 text-sm text-muted">
            Once you add something it will show up here.
          </p>
          <Button className="mt-6" onClick={() => go("/")}>
            Start shopping
          </Button>
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <div className="divide-y divide-line px-5">
          {cart.items.map((item) => (
            <CartLineItem key={item.sku} item={item} onNavigate={close} />
          ))}
        </div>
      )}
    </Drawer>
  );
}
