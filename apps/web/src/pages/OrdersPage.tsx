import { Link, useNavigate } from "react-router-dom";
import { useOrders } from "@/hooks/useOrders";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (s.includes("cancel")) return "sale" as const;
  if (s.includes("deliver")) return "new" as const;
  return "neutral" as const;
}

export function OrdersPage() {
  const { data, isLoading } = useOrders();
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );

  if (!data || data.length === 0)
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order it will appear here."
        action={<Button onClick={() => navigate("/")}>Start shopping</Button>}
      />
    );

  return (
    <div className="container-px py-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold uppercase tracking-tight">
        My orders
      </h1>
      <div className="space-y-3">
        {data.map((o) => (
          <Link
            key={o.id}
            to={`/account/orders/${o.id}`}
            className="flex items-center justify-between gap-4 border border-line p-4 transition-colors hover:border-fg"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm font-bold">
                  {o.orderNumber}
                </span>
                <Badge tone={statusTone(o.status)}>{o.status}</Badge>
              </div>
              <p className="mt-1 text-[13px] text-muted">
                {new Date(o.createdAt).toLocaleDateString()} · {o.items.length}{" "}
                item{o.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="-space-x-3 hidden sm:flex">
                {o.items.slice(0, 3).map((it) => (
                  <img
                    key={it.sku}
                    src={it.image}
                    alt=""
                    className="h-12 w-9 border border-bg bg-surface object-cover"
                  />
                ))}
              </div>
              <span className="font-semibold">
                {formatPrice(o.total, o.currency)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
