import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/products";
import { useAdminDeleteProduct } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToastStore } from "@/store/toastStore";
import { formatPrice } from "@/lib/utils";
import type { ProductSummary } from "@/types/api";

export function AdminProductsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["products", { admin: true }],
    queryFn: () => getProducts({ limit: 60, sort: "newIn" }),
  });
  const del = useAdminDeleteProduct();
  const pushToast = useToastStore((s) => s.push);
  const [target, setTarget] = useState<ProductSummary | null>(null);

  const confirmDelete = () => {
    if (!target) return;
    del.mutate(target.id, {
      onSuccess: () => {
        pushToast("Product deleted", "success");
        setTarget(null);
        refetch();
      },
      onError: (e) =>
        pushToast(e instanceof Error ? e.message : "Delete failed", "error"),
    });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-muted">{data?.total ?? 0} products</p>
        <Link to="/admin/products/new">
          <Button size="sm">New product</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="divide-y divide-line border-y border-line">
          {data?.items.map((p) => (
            <div key={p.id} className="flex items-center gap-4 py-3">
              <img
                src={p.colors[0]?.images[0]?.url}
                alt=""
                className="h-16 w-12 shrink-0 bg-surface object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="eyebrow text-muted">{p.brand}</p>
                <p className="truncate text-sm">{p.name}</p>
                <p className="text-[12px] text-muted">
                  {formatPrice(p.salePrice ?? p.price, p.currency)} · {p.gender}
                </p>
              </div>
              <Link to={`/admin/products/${p.slug}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTarget(p)}
                className="text-sale"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!target}
        title="Delete product"
        message={target ? `Delete “${target.name}”? This cannot be undone.` : ""}
        loading={del.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
