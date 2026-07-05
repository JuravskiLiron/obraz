import { Link } from "react-router-dom";
import type { CartItem } from "@/types/api";
import { formatPrice } from "@/lib/utils";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/useCart";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";

export function CartLineItem({
  item,
  onNavigate,
}: {
  item: CartItem;
  onNavigate?: () => void;
}) {
  const update = useUpdateCartItem();
  const remove = useRemoveCartItem();
  const busy = update.isPending || remove.isPending;
  const atMax = item.qty >= item.stock;

  return (
    <div className="flex gap-3 py-4">
      <Link
        to={`/product/${item.slug}`}
        onClick={onNavigate}
        className="shrink-0"
      >
        <img
          src={item.image}
          alt={item.name}
          className="h-28 w-21 bg-surface object-cover"
          style={{ width: "5.25rem" }}
          loading="lazy"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={`/product/${item.slug}`}
            onClick={onNavigate}
            className="min-w-0"
          >
            <p className="eyebrow text-muted">{item.brand}</p>
            <p className="truncate text-sm">{item.name}</p>
          </Link>
          <button
            aria-label="Remove"
            disabled={busy}
            onClick={() => remove.mutate(item.sku)}
            className="p-1 text-muted hover:text-sale disabled:opacity-50"
          >
            {remove.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <TrashIcon className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>

        <p className="mt-1 text-[12px] text-muted">
          {item.color} · Size {item.size}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center border border-line">
            <button
              aria-label="Decrease quantity"
              disabled={busy || item.qty <= 1}
              onClick={() =>
                update.mutate({ sku: item.sku, qty: item.qty - 1 })
              }
              className="grid h-8 w-8 place-items-center disabled:opacity-30"
            >
              <MinusIcon className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-sm tabular-nums">
              {item.qty}
            </span>
            <button
              aria-label="Increase quantity"
              disabled={busy || atMax}
              onClick={() =>
                update.mutate({ sku: item.sku, qty: item.qty + 1 })
              }
              className="grid h-8 w-8 place-items-center disabled:opacity-30"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(item.price * item.qty, "USD")}
          </span>
        </div>
        {atMax && (
          <p className="pt-1 text-[11px] text-sale">
            Only {item.stock} in stock
          </p>
        )}
      </div>
    </div>
  );
}
