import { useAdminOrders, useAdminUpdateOrderStatus } from "@/hooks/useAdmin";
import { Spinner } from "@/components/ui/Spinner";
import { useToastStore } from "@/store/toastStore";
import { formatPrice } from "@/lib/utils";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export function AdminOrdersPage() {
  const { data, isLoading } = useAdminOrders();
  const update = useAdminUpdateOrderStatus();
  const pushToast = useToastStore((s) => s.push);

  if (isLoading)
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    );

  if (!data || data.length === 0)
    return <p className="py-10 text-sm text-muted">No orders yet.</p>;

  return (
    <div className="divide-y divide-line border-y border-line">
      {data.map((o) => (
        <div
          key={o.id}
          className="flex flex-wrap items-center justify-between gap-3 py-4"
        >
          <div>
            <p className="font-display text-sm font-bold">{o.orderNumber}</p>
            <p className="text-[12px] text-muted">
              {new Date(o.createdAt).toLocaleString()} · {o.items.length} items ·{" "}
              {formatPrice(o.total, o.currency)}
            </p>
          </div>
          <select
            value={o.status.toLowerCase()}
            onChange={(e) =>
              update.mutate(
                { id: o.id, status: e.target.value },
                {
                  onSuccess: () => pushToast("Status updated", "success"),
                  onError: () => pushToast("Update failed", "error"),
                },
              )
            }
            className="border border-line bg-bg px-3 py-2 text-[13px] capitalize outline-none focus-visible:ring-2"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
