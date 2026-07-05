import { useRecentStore } from "@/store/recentStore";
import { ProductCard } from "@/components/product/ProductCard";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const items = useRecentStore((s) => s.items).filter(
    (p) => p.id !== excludeId,
  );
  if (items.length === 0) return null;

  return (
    <section className="container-px py-10">
      <h2 className="mb-5 font-display text-lg font-bold uppercase tracking-wide">
        Recently viewed
      </h2>
      <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2">
        {items.map((p) => (
          <div key={p.id} className="w-40 shrink-0 sm:w-48">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
