import type { ProductSummary } from "@/types/api";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

export function ProductRail({
                                title,
                                products,
                                loading,
                                cta,
                            }: {
    title: string;
    products?: ProductSummary[];
    loading?: boolean;
    cta?: React.ReactNode;
}) {
    if (!loading && (!products || products.length === 0)) return null;
    return (
        <section className="container-px py-10">
            <div className="mb-5 flex items-end justify-between">
                <h2 className="font-display text-xl font-bold uppercase tracking-wide">
                    {title}
                </h2>
                {cta}
            </div>
            <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto pb-2 sm:mx-0 sm:gap-4">
                {products?.map((p) => (
                    <div key={p.id} className="w-[46vw] shrink-0 sm:w-52 lg:w-60">
                        <ProductCard product={p} />
                    </div>
                ))}
                {loading &&
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="w-[46vw] shrink-0 sm:w-52 lg:w-60">
                            <ProductCardSkeleton />
                        </div>
                    ))}
            </div>
        </section>
    );
}