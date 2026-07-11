import { Link } from "react-router-dom";
import { useUiStore } from "@/store/uiStore";
import { useNewIn, useTrending } from "@/hooks/useProducts";
import { useCategoryTree } from "@/hooks/useCatalog";
import { ProductRail } from "@/components/product/ProductRail";
import { RecentlyViewed } from "@/components/common/RecentlyViewed";
import { ArrowRight } from "@/components/ui/icons";

export function HomePage() {
  const gender = useUiStore((s) => s.gender);
  const newIn = useNewIn(undefined, 12);
  const trending = useTrending(undefined, 12);
  const { data: tree } = useCategoryTree(gender);
  const topCats = tree?.slice(0, 6) ?? [];

  return (
    <div>
      {/* Hero */}
        {/* Hero */}
        <section className="relative">
            {/* ---------- Mobile: single premium hero + dual CTAs ---------- */}
            <div className="sm:hidden">
                <div className="relative flex min-h-[440px] flex-col justify-end overflow-hidden bg-surface [height:74vh]">
                    <img
                        src="https://res.cloudinary.com/gyz51tix/image/upload/v1783222083/IMAGE_2026-07-05_06_27_59_t3jcsj.jpg"
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />
                    <div className="relative animate-slide-up p-6">
                        <p className="eyebrow text-fg/70"></p>
                        <h1 className="mt-2 font-display text-[3.25rem] font-extrabold uppercase leading-[0.9] tracking-tight text-fg">

                            <br />
                            Spring / Summer 26
                        </h1>
                        <p className="mt-3 max-w-[15rem] text-[13px] leading-relaxed text-fg/75">

                        </p>
                        <div className="mt-6 flex gap-3">
                            <Link
                                to="/women"
                                className="flex h-12 flex-1 items-center justify-center bg-fg text-[12px] font-semibold uppercase tracking-[0.09em] text-bg transition-transform active:scale-[0.98]"
                            >
                                Shop women
                            </Link>
                            <Link
                                to="/men"
                                className="flex h-12 flex-1 items-center justify-center border border-fg text-[12px] font-semibold uppercase tracking-[0.09em] text-fg transition-transform active:scale-[0.98]"
                            >
                                Shop men
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ---------- Desktop: split women / men ---------- */}
            <div className="hidden sm:grid sm:grid-cols-2">
                {(["women", "men"] as const).map((g) => (
                    <Link
                        key={g}
                        to={`/${g}`}
                        className="group relative flex h-[68vh] min-h-[440px] max-h-[680px] items-end overflow-hidden bg-surface"
                    >
                        <div
                            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                            style={{
                                background:
                                    g === "women"
                                        ? "linear-gradient(135deg,#e8e2dc,#cfc6bd)"
                                        : "linear-gradient(135deg,#d4d8dc,#a9b0b6)",
                            }}
                        />
                        <div className="relative w-full p-10">
                            <p className="eyebrow text-fg/70">Spring / Summer</p>
                            <h2 className="mt-1 font-display text-4xl font-extrabold uppercase tracking-tight">
                                Shop {g}
                            </h2>
                            <span className="mt-3 inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] underline underline-offset-4">
                  Discover now <ArrowRight className="h-4 w-4" />
                </span>
                        </div>
                    </Link>
                ))}
            </div>
        </section>

      <ProductRail
        title="New in"
        products={newIn.data}
        loading={newIn.isLoading}
        cta={
          <Link
            to={`/${gender}?isNew=true`}
            className="text-[12px] font-semibold uppercase tracking-wide text-muted underline hover:text-fg"
          >
            View all
          </Link>
        }
      />

      {/* Shop by category */}
      {topCats.length > 0 && (
        <section className="container-px py-10">
          <h2 className="mb-5 font-display text-xl font-bold uppercase tracking-wide">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {topCats.map((c) => (
              <Link
                key={c.id}
                to={`/${gender}/${c.slug}`}
                className="group flex aspect-square flex-col items-center justify-center gap-2 border border-line text-center transition-colors hover:border-fg"
              >
                <span className="text-[13px] font-semibold uppercase tracking-[0.08em]">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRail
        title="Trending now"
        products={trending.data}
        loading={trending.isLoading}
      />

      <RecentlyViewed />
    </div>
  );
}
