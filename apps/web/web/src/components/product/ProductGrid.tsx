import type { ProductSummary } from "@/types/api";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export function ProductGrid({
  products,
  loading,
  skeletonCount = 8,
}: {
  products?: ProductSummary[];
  loading?: boolean;
  skeletonCount?: number;
}) {
  return (
      <div className="-mx-4 grid grid-cols-2 gap-x-0.5 gap-y-6 sm:mx-0 sm:gap-x-4 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">      {products?.map((p, i) => (
        <ProductCard key={p.id} product={p} eager={i < 4} />
      ))}
      {loading &&
        Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={`s-${i}`} />
        ))}
    </div>
  );
}
