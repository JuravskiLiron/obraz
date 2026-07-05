import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { useAddToCart } from "@/hooks/useCart";
import { useToggleWishlist, useIsWishlisted } from "@/hooks/useWishlist";
import { useUiStore } from "@/store/uiStore";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { useRecentStore } from "@/store/recentStore";
import { Gallery } from "@/components/pdp/Gallery";
import { SizeSelector } from "@/components/pdp/SizeSelector";
import { SizeGuideModal } from "@/components/pdp/SizeGuideModal";
import { ProductAccordions } from "@/components/pdp/ProductAccordions";
import { ProductRail } from "@/components/product/ProductRail";
import { RecentlyViewed } from "@/components/common/RecentlyViewed";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/common/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { HeartIcon, HeartFilledIcon, StarIcon } from "@/components/ui/icons";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import type { ProductSummary } from "@/types/api";

const LOW_STOCK = 5;
const SELLING_FAST = 8;

export function ProductPage() {
  const { slug } = useParams();
  const { data: product, isLoading, isError, refetch } = useProduct(slug);

  const [colorIdx, setColorIdx] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [showSticky, setShowSticky] = useState(false);

  const actionsRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const addToCart = useAddToCart();
  const openDrawer = useUiStore((s) => s.openDrawer);
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const pushToast = useToastStore((s) => s.push);
  const addRecent = useRecentStore((s) => s.add);
  const toggleWish = useToggleWishlist();
  const wishlisted = useIsWishlisted(product?.id ?? "");

  // Reset selection + record recently viewed when the product changes.
  useEffect(() => {
    if (!product) return;
    setColorIdx(0);
    setSize(null);
    setTriedSubmit(false);
    const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
    const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
    const summary: ProductSummary = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      gender: product.gender,
      categoryId: product.categoryId,
      price: product.price,
      salePrice: product.salePrice,
      currency: product.currency,
      colors: product.colors,
      sizes,
      isNew: product.isNew,
      onSale: product.onSale,
      lowStock: totalStock > 0 && totalStock <= LOW_STOCK,
      totalStock,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
    };
    addRecent(summary);
  }, [product, addRecent]);

  // Show the sticky mobile bar only after the main CTA has scrolled ABOVE the
  // viewport (i.e. the user scrolled past it) — not while it's still below the fold.
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
        ([entry]) => {
          const scrolledPast = entry.boundingClientRect.top < 0;
          setShowSticky(!entry.isIntersecting && scrolledPast);
        },
        { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [product]);

  const color = product?.colors[colorIdx] ?? product?.colors[0];

  // Sizes available for the chosen colour (out-of-stock disabled).
  const { sizeRun, disabled, variantFor } = useMemo(() => {
    if (!product || !color)
      return { sizeRun: [] as string[], disabled: [] as string[], variantFor: {} as Record<string, number> };
    const forColor = product.variants.filter((v) => v.color === color.name);
    const run = Array.from(new Set(forColor.map((v) => v.size)));
    const dis = run.filter((s) => {
      const v = forColor.find((x) => x.size === s);
      return !v || v.stock <= 0;
    });
    const stockBySize: Record<string, number> = {};
    for (const v of forColor) stockBySize[v.size] = v.stock;
    return { sizeRun: run, disabled: dis, variantFor: stockBySize };
  }, [product, color]);

  if (isLoading) return <PdpSkeleton />;
  if (isError || !product) return <ErrorState onRetry={() => refetch()} />;

  const chosenVariant =
      color && size
          ? product.variants.find((v) => v.color === color.name && v.size === size)
          : undefined;
  const stock = size ? (variantFor[size] ?? 0) : 0;
  const price = chosenVariant?.price ?? product.price;
  const salePrice = chosenVariant?.salePrice ?? product.salePrice;
  const discount = discountPercent(price, salePrice);

  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const sellingFast = totalStock > 0 && totalStock <= SELLING_FAST;

  const onAdd = () => {
    if (!size || !chosenVariant) {
      setTriedSubmit(true);
      pushToast("Please select a size", "error");
      return;
    }
    addToCart.mutate(
        { productId: product.id, sku: chosenVariant.sku, qty: 1 },
        {
          onSuccess: () => {
            pushToast("Added to bag", "success");
            openDrawer("cart");
          },
          onError: (e) =>
              pushToast(e instanceof Error ? e.message : "Could not add to bag", "error"),
        },
    );
  };

  // Sticky-bar add: if no size chosen, scroll the size picker into view first.
  const onAddSticky = () => {
    if (!size) {
      setTriedSubmit(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      pushToast("Please select a size", "error");
      return;
    }
    onAdd();
  };

  const onSave = () => {
    if (!isAuthed) {
      pushToast("Sign in to save items", "default");
      return;
    }
    toggleWish.mutate(
        { productId: product.id, active: wishlisted },
        {
          onSuccess: () =>
              pushToast(wishlisted ? "Removed from saved" : "Saved", "success"),
        },
    );
  };

  const priceBlock = (
      <>
        {salePrice != null ? (
            <>
          <span className="text-lg font-semibold text-sale">
            {formatPrice(salePrice, product.currency)}
          </span>
              <span className="text-sm text-subtle line-through">
            {formatPrice(price, product.currency)}
          </span>
              {discount != null && (
                  <span className="text-[13px] font-semibold text-sale">
              (-{discount}%)
            </span>
              )}
            </>
        ) : (
            <span className="text-lg font-semibold">
          {formatPrice(price, product.currency)}
        </span>
        )}
      </>
  );

  return (
      <div className="pb-20 lg:pb-0">
        <div className="container-px grid grid-cols-1 gap-8 pb-6 pt-0 lg:grid-cols-2 lg:gap-12 lg:pt-6">
          <Gallery images={color?.images ?? []} alt={`${product.brand} ${product.name}`} />

          <div className="lg:max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              {product.isNew && <Badge tone="new">New</Badge>}
              {discount != null && <Badge tone="sale">-{discount}%</Badge>}
              {sellingFast && <Badge tone="new">Selling fast</Badge>}
            </div>
            <p className="mt-3 eyebrow text-muted">{product.brand}</p>
            <h1 className="mt-1 font-display text-xl font-bold sm:text-2xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              {priceBlock}
              {product.rating != null && (
                  <span className="flex items-center gap-1 text-[13px] text-muted">
                <StarIcon className="h-4 w-4 text-fg" />
                    {product.rating.toFixed(1)}
                    {product.reviewsCount != null && ` (${product.reviewsCount})`}
              </span>
              )}
            </div>

            {/* Model / fit info line */}
            {product.attributes.modelInfo && (
                <p className="mt-3 text-[13px] text-muted">
                  {product.attributes.modelInfo}
                  {product.attributes.fit ? ` · ${product.attributes.fit}` : ""}
                </p>
            )}

            {/* Colour — as image thumbnails */}
            {product.colors.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.08em]">
                    Colour: <span className="text-muted">{color?.name}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c, i) => (
                        <button
                            key={`${c.name}-${i}`}
                            type="button"
                            onClick={() => {
                              setColorIdx(i);
                              setSize(null);
                            }}
                            aria-label={c.name}
                            aria-pressed={colorIdx === i}
                            title={c.name}
                            className={cn(
                                "h-[68px] w-[52px] overflow-hidden bg-surface ring-inset transition-shadow",
                                colorIdx === i
                                    ? "ring-2 ring-fg"
                                    : "ring-1 ring-line hover:ring-fg/50",
                            )}
                        >
                          <img
                              src={c.images[0]?.url}
                              alt=""
                              loading="lazy"
                              className="h-full w-full object-cover"
                          />
                        </button>
                    ))}
                  </div>
                </div>
            )}

            {/* Size */}
            <div className="mt-5" ref={sizeRef}>
              <SizeSelector
                  sizes={sizeRun}
                  selected={size}
                  disabled={disabled}
                  onSelect={setSize}
                  onOpenGuide={() => setGuideOpen(true)}
              />
              {triedSubmit && !size && (
                  <p className="mt-2 text-[12px] text-sale">
                    Select a size to add to bag.
                  </p>
              )}
              {size && stock > 0 && stock <= LOW_STOCK && (
                  <p className="mt-2 text-[12px] text-sale">
                    Hurry — only {stock} left in stock.
                  </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3" ref={actionsRef}>
              <Button
                  fullWidth
                  size="lg"
                  loading={addToCart.isPending}
                  onClick={onAdd}
              >
                Add to bag
              </Button>
              <Button
                  variant="outline"
                  size="lg"
                  aria-label="Save"
                  onClick={onSave}
                  className="!px-4"
              >
                {wishlisted ? (
                    <HeartFilledIcon className="h-5 w-5 text-sale" />
                ) : (
                    <HeartIcon className="h-5 w-5" />
                )}
              </Button>
            </div>

            {/* Delivery reassurance */}
            <div className="mt-4 flex items-start gap-2.5 border border-line p-3 text-[12px] text-muted">
              <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mt-0.5 shrink-0"
                  aria-hidden
              >
                <path
                    d="M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5Zm-7.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                />
              </svg>
              <p>
                Delivery calculated at checkout.{" "}
                <span className="text-fg">Free 28-day returns.</span>
              </p>
            </div>

            <div className="mt-8">
              <ProductAccordions product={product} />
            </div>
          </div>
        </div>

        {product.related.length > 0 && (
            <ProductRail title="Complete the look" products={product.related} />
        )}
        <RecentlyViewed excludeId={product.id} />

        <SizeGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

        {/* Sticky mobile Add-to-Bag bar */}
        {showSticky && (
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-bg px-4 py-3 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] lg:hidden">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-muted">{product.name}</p>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {salePrice != null ? (
                      <>
                  <span className="text-sale">
                    {formatPrice(salePrice, product.currency)}
                  </span>
                        <span className="text-[12px] text-subtle line-through">
                    {formatPrice(price, product.currency)}
                  </span>
                      </>
                  ) : (
                      formatPrice(price, product.currency)
                  )}
                </p>
              </div>
              <button
                  type="button"
                  onClick={onSave}
                  aria-label={wishlisted ? "Remove from saved" : "Save"}
                  className="grid h-11 w-11 shrink-0 place-items-center border border-fg"
              >
                {wishlisted ? (
                    <HeartFilledIcon className="h-5 w-5 text-sale" />
                ) : (
                    <HeartIcon className="h-5 w-5" />
                )}
              </button>
              <Button
                  size="md"
                  className="shrink-0 px-6"
                  loading={addToCart.isPending}
                  onClick={onAddSticky}
              >
                Add to bag
              </Button>
            </div>
        )}
      </div>
  );
}

function PdpSkeleton() {
  return (
      <div className="container-px grid grid-cols-1 gap-8 pb-6 pt-0 lg:grid-cols-2 lg:gap-12 lg:pt-6">
        <Skeleton className="aspect-[3/4] w-full" />
        <div className="space-y-4 lg:max-w-md">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
  );
}