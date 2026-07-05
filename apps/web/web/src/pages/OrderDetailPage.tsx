import { Link, useParams } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { ErrorState } from "@/components/common/ErrorState";
import { formatPrice } from "@/lib/utils";
import { CheckIcon } from "@/components/ui/icons";

export function OrderDetailPage() {
  const { id } = useParams();
  const { data: order, isLoading, isError, refetch } = useOrder(id);

  if (isLoading)
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );
  if (isError || !order) return <ErrorState onRetry={() => refetch()} />;

  const a = order.shippingAddress;

  return (
    <div className="container-px py-8">
      <Link
        to="/account/orders"
        className="text-[13px] text-muted underline hover:text-fg"
      >
        ← All orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          {order.orderNumber}
        </h1>
        <Badge tone="neutral">{order.status}</Badge>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[13px] text-success">
        <CheckIcon className="h-4 w-4" />
        Order confirmed · {new Date(order.createdAt).toLocaleDateString()}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-line border-y border-line">
          {order.items.map((it) => (
            <div key={it.sku} className="flex gap-3 py-4">
              <img
                src={it.image}
                alt=""
                className="h-24 w-18 shrink-0 bg-surface object-cover"
                style={{ width: "4.5rem" }}
              />
              <div className="flex-1">
                <p className="eyebrow text-muted">{it.brand}</p>
                <p className="text-sm">{it.name}</p>
                <p className="mt-1 text-[12px] text-muted">
                  {it.color} · Size {it.size} · Qty {it.qty}
                </p>
              </div>
              <span className="text-sm font-semibold">
                {formatPrice(it.price * it.qty, order.currency)}
              </span>
            </div>
          ))}
        </div>

        <aside className="space-y-6">
          <div className="border border-line p-5">
            <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide">
              Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Delivery ({order.deliveryMethod})</span>
                <span>
                  {order.shipping === 0
                    ? "Free"
                    : formatPrice(order.shipping, order.currency)}
                </span>
              </div>
              <div className="flex justify-between border-t border-line pt-2 font-semibold">
                <span>Total</span>
                <span className="font-display text-base font-bold">
                  {formatPrice(order.total, order.currency)}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-line p-5 text-sm">
            <h2 className="mb-3 font-display text-base font-bold uppercase tracking-wide">
              Delivery to
            </h2>
            <p className="font-medium">{a.fullName}</p>
            <p className="mt-1 text-muted">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
              <br />
              {a.city}, {a.postalCode}
              <br />
              {a.country}
              <br />
              {a.phone}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
