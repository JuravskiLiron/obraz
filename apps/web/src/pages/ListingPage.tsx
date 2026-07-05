import { useCallback, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import type { CategoryNode, ProductQuery, ProductSort, Gender } from "@/types/api";
import { useProductList } from "@/hooks/useProducts";
import { useCategoryTree } from "@/hooks/useCatalog";
import { useUiStore } from "@/store/uiStore";
import { ProductGrid } from "@/components/product/ProductGrid";
import { FilterSidebar, type FilterState } from "@/components/plp/FilterSidebar";
import { FilterDrawer } from "@/components/plp/FilterDrawer";
import { ActiveFilters } from "@/components/plp/ActiveFilters";
import { SortSelect } from "@/components/plp/SortSelect";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { FilterIcon } from "@/components/ui/icons";

function findBySlug(nodes: CategoryNode[] | undefined, slug: string): CategoryNode | undefined {
  if (!nodes) return undefined;
  for (const n of nodes) {
    if (n.slug === slug) return n;
    const f = findBySlug(n.children, slug);
    if (f) return f;
  }
  return undefined;
}

const titleize = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export function ListingPage({
  search,
  gender: genderProp,
}: {
  search?: boolean;
  gender?: Gender;
}) {
  const params = useParams();
  const [sp, setSp] = useSearchParams();
  const openDrawer = useUiStore((s) => s.openDrawer);
  const gender = genderProp ?? (params.gender as Gender | undefined);
  const categorySlug = params.categorySlug;
  const q = sp.get("q") ?? undefined;

  const { data: tree } = useCategoryTree(gender);
  const category = categorySlug ? findBySlug(tree, categorySlug) : undefined;

  // ---- URL -> FilterState ----
  const csv = (key: string) =>
    (sp.get(key) ?? "").split(",").filter(Boolean);
  const state: FilterState = {
    sizes: csv("sizes"),
    colors: csv("colors"),
    brands: csv("brands"),
    minPrice: sp.get("minPrice") ? Number(sp.get("minPrice")) : undefined,
    maxPrice: sp.get("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
    onSale: sp.get("onSale") === "true",
    isNew: sp.get("isNew") === "true",
    sort: (sp.get("sort") as ProductSort) ?? "recommended",
  };

  const patch = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(sp);
      mutate(next);
      setSp(next, { replace: true });
    },
    [sp, setSp],
  );

  const handlers = useMemo(
    () => ({
      toggleArray: (key: "sizes" | "colors" | "brands", value: string) =>
        patch((p) => {
          const cur = (p.get(key) ?? "").split(",").filter(Boolean);
          const nextArr = cur.includes(value)
            ? cur.filter((v) => v !== value)
            : [...cur, value];
          if (nextArr.length) p.set(key, nextArr.join(","));
          else p.delete(key);
        }),
      setPrice: (lo: number, hi: number) =>
        patch((p) => {
          p.set("minPrice", String(lo));
          p.set("maxPrice", String(hi));
        }),
      clearPrice: () =>
        patch((p) => {
          p.delete("minPrice");
          p.delete("maxPrice");
        }),
      setBool: (key: "onSale" | "isNew", value: boolean) =>
        patch((p) => {
          if (value) p.set(key, "true");
          else p.delete(key);
        }),
      setSort: (s: ProductSort) =>
        patch((p) => {
          if (s === "recommended") p.delete("sort");
          else p.set("sort", s);
        }),
    }),
    [patch],
  );

  const clearAll = useCallback(() => {
    patch((p) => {
      for (const k of [
        "sizes",
        "colors",
        "brands",
        "minPrice",
        "maxPrice",
        "onSale",
        "isNew",
        "sort",
      ])
        p.delete(k);
    });
  }, [patch]);

  // ---- build query ----
  const query: ProductQuery = {
    gender,
    category: categorySlug,
    q,
    sizes: state.sizes,
    colors: state.colors,
    brands: state.brands,
    minPrice: state.minPrice,
    maxPrice: state.maxPrice,
    onSale: state.onSale || undefined,
    isNew: state.isNew || undefined,
    sort: state.sort,
  };

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductList(query);

  const products = data?.pages.flatMap((p) => p.items) ?? [];
  const facets = data?.pages[0]?.facets;
  const total = data?.pages[0]?.total ?? 0;

  // ---- infinite scroll ----
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, products.length]);

  const heading = search
    ? `Search${q ? `: “${q}”` : ""}`
    : category
      ? category.name
      : gender
        ? titleize(gender)
        : "Shop";

  return (
    <div className="container-px py-6">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-tight">
          {heading}
        </h1>
        {!isLoading && (
          <p className="mt-1 text-[13px] text-muted">{total} items</p>
        )}
      </div>

      {/* toolbar */}
      <div className="sticky top-14 z-30 -mx-4 mb-5 flex items-center justify-between gap-3 border-y border-line bg-bg/95 px-4 py-2.5 backdrop-blur lg:top-[72px]">
        <button
          onClick={() => openDrawer("filter")}
          className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wide lg:hidden"
        >
          <FilterIcon className="h-5 w-5" /> Filter
        </button>
        <span className="hidden text-[13px] text-muted lg:block">
          {total} items
        </span>
        <SortSelect value={state.sort} onChange={handlers.setSort} />
      </div>

      <div className="flex gap-8">
        {/* desktop sidebar */}
        {facets && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <FilterSidebar facets={facets} state={state} handlers={handlers} />
          </aside>
        )}

        <div className="min-w-0 flex-1">
          {facets && (
            <div className="mb-4">
              <ActiveFilters
                state={state}
                handlers={handlers}
                onClearAll={clearAll}
                priceBounds={{ min: facets.minPrice, max: facets.maxPrice }}
              />
            </div>
          )}

          {isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : !isLoading && products.length === 0 ? (
            <EmptyState
              title="No results"
              description="Try removing some filters or searching for something else."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <>
              <ProductGrid products={products} loading={isLoading} />
              <div ref={sentinel} className="h-4" />
              {isFetchingNextPage && (
                <div className="grid place-items-center py-8">
                  <Spinner />
                </div>
              )}
              {hasNextPage && !isFetchingNextPage && (
                <div className="grid place-items-center py-8">
                  <Button variant="outline" onClick={() => fetchNextPage()}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {facets && (
        <FilterDrawer
          facets={facets}
          state={state}
          handlers={handlers}
          total={total}
          onClearAll={clearAll}
        />
      )}
    </div>
  );
}
