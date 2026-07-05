import { useState } from "react";
import { Link } from "react-router-dom";
import type { ProductSummary } from "@/types/api";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ProductImage } from "./ProductImage";
import { ColorSwatches } from "./ColorSwatches";
import { HeartIcon, HeartFilledIcon } from "@/components/ui/icons";
import { useToggleWishlist, useIsWishlisted } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

export function ProductCard({
  product,
  eager,
}: {
  product: ProductSummary;
  eager?: boolean;
}) {
  const [colorIdx, setColorIdx] = useState(0);
  const color = product.colors[colorIdx] ?? product.colors[0];
  const images = color?.images ?? [];
  const primary = images[0]?.url;
  const secondary = images[1]?.url;

  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const wishlisted = useIsWishlisted(product.id);
  const toggle = useToggleWishlist();
  const pushToast = useToastStore((s) => s.push);

  const discount = discountPercent(product.price, product.salePrice);

  const onWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      pushToast("Sign in to save items", "default");
      return;
    }
    toggle.mutate(
      { productId: product.id, active: wishlisted },
      {
        onSuccess: () =>
          pushToast(wishlisted ? "Removed from saved" : "Saved", "success"),
        onError: () => pushToast("Could not update saved items", "error"),
      },
    );
  };

  return (
    <div className="group/card">
      <Link
        to={`/product/${product.slug}`}
        className="relative block aspect-[3/4] overflow-hidden bg-surface"
      >
        {primary && (
          <ProductImage
            src={primary}
            alt={`${product.brand} ${product.name}`}
            eager={eager}
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        )}
        {/* Hover-swap second image — hover-capable pointers only. */}
        {secondary && (
          <img
            src={secondary}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover/card:opacity-100"
          />
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.isNew && <Badge tone="new">New</Badge>}
          {discount != null && <Badge tone="sale">-{discount}%</Badge>}
        </div>

        {product.lowStock && (
          <div className="absolute bottom-2 left-2">
            <Badge tone="low">Low in stock</Badge>
          </div>
        )}

        <button
          type="button"
          onClick={onWishlist}
          aria-label={wishlisted ? "Remove from saved" : "Save"}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-bg/80 text-fg backdrop-blur transition hover:bg-bg"
        >
          {wishlisted ? (
            <HeartFilledIcon className="h-[18px] w-[18px] text-sale" />
          ) : (
            <HeartIcon className="h-[18px] w-[18px]" />
          )}
        </button>
      </Link>

      <div className="px-2 pt-2.5 sm:px-0">
        <Link to={`/product/${product.slug}`} className="block">
          <p className="eyebrow text-muted">{product.brand}</p>
          <h3 className="mt-0.5 truncate text-[13px] text-fg">{product.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          {product.salePrice != null ? (
            <>
              <span className="text-[13px] font-semibold text-sale">
                {formatPrice(product.salePrice, product.currency)}
              </span>
              <span className="text-[12px] text-subtle line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          ) : (
            <span className="text-[13px] font-semibold text-fg">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>
        {product.colors.length > 1 && (
          <div className="mt-2">
            <ColorSwatches
              colors={product.colors}
              selected={colorIdx}
              onSelect={setColorIdx}
              max={5}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="shimmer relative aspect-[3/4] overflow-hidden bg-surface" />
      <div className="space-y-2 pt-2.5">
        <div className="h-2.5 w-1/3 bg-surface" />
        <div className="h-3 w-3/4 bg-surface" />
        <div className="h-3 w-1/4 bg-surface" />
      </div>
    </div>
  );
}
