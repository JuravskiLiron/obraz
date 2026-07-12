import { useEffect, useRef, useState, type MouseEvent, type UIEvent } from "react";
import type { ImageDto } from "@/types/api";
import { cn } from "@/lib/utils";
import { ProductImage } from "@/components/product/ProductImage";
import {
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  ZoomIcon,
} from "@/components/ui/icons";

export function Gallery({ images, alt }: { images: ImageDto[]; alt: string }) {
  const list = images.length ? images : [{ url: "", alt }];
  const [active, setActive] = useState(0);
  const [fsOpen, setFsOpen] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [hovering, setHovering] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const current = list[Math.min(active, list.length - 1)];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  // Mobile carousel: derive active slide from scroll position.
  const onTrackScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active) setActive(i);
  };

  const scrollToSlide = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const step = (d: number) =>
      setActive((a) => (a + d + list.length) % list.length);

  // Lock body scroll while the full-screen viewer is open.
  useEffect(() => {
    if (!fsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFsOpen(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [fsOpen]);

  return (
      <>
        {/* ---------- Desktop: thumbnail rail + hover-zoom ---------- */}
        <div className="hidden gap-3 lg:flex">
          {list.length > 1 && (
              <div className="no-scrollbar flex max-h-[680px] w-16 shrink-0 flex-col gap-2 overflow-y-auto">
                {list.map((img, i) => (
                    <button
                        key={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => setActive(i)}
                        aria-label={`View image ${i + 1}`}
                        className={cn(
                            "relative h-[58vh] max-h-[560px] w-full shrink-0 snap-start snap-always bg-surface",
                            active === i ? "ring-2 ring-fg" : "ring-1 ring-line hover:ring-fg/40",
                        )}
                    >
                      <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                ))}
              </div>
          )}

          <div className="min-w-0 flex-1">
            <div
                className="group/zoom relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-surface"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onMouseMove={onMove}
                onClick={() => setFsOpen(true)}
            >
              <img
                  key={current.url}
                  src={current.url}
                  alt={current.alt || alt}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover/zoom:scale-[2]"
                  style={{ transformOrigin: hovering ? origin : "center" }}
              />
              <span className="pointer-events-none absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-bg/85 text-fg shadow-sm backdrop-blur transition-opacity group-hover/zoom:opacity-0">
              <ZoomIcon className="h-5 w-5" />
            </span>
            </div>
          </div>
        </div>

        {/* ---------- Mobile: swipe carousel (no arrows, ASOS-style) ---------- */}
        <div className="-mx-4 sm:-mx-6 lg:mx-0 lg:hidden">
          <div className="relative">
            <div
                ref={trackRef}
                onScroll={onTrackScroll}
                className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
            >
              {list.map((img, i) => (
                  <button
                      key={i}
                      onClick={() => setFsOpen(true)}
                      className="relative aspect-[3/4] w-full shrink-0 snap-start snap-always bg-surface"
                      style={{ minWidth: "100%" }}
                      aria-label="Open full-screen image"
                  >
                    <ProductImage src={img.url} alt={img.alt || alt} eager={i === 0} />
                  </button>
              ))}
            </div>

            {list.length > 1 && (
                <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-fg/80 px-2.5 py-1 text-[11px] font-medium text-bg">
              {active + 1}/{list.length}
            </span>
            )}
          </div>

          {list.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {list.map((_, i) => (
                    <button
                        key={i}
                        aria-label={`Go to image ${i + 1}`}
                        onClick={() => scrollToSlide(i)}
                        className={cn(
                            "h-1.5 rounded-full transition-all",
                            active === i ? "w-6 bg-fg" : "w-1.5 bg-line",
                        )}
                    />
                ))}
              </div>
          )}
        </div>

        {/* ---------- True full-screen viewer (black, no frame) ---------- */}
        {fsOpen && (
            <div className="fixed inset-0 z-[80] flex flex-col bg-black">
              <div className="flex justify-end p-3">
                <button
                    aria-label="Close"
                    onClick={() => setFsOpen(false)}
                    className="grid h-11 w-11 place-items-center text-white/90 hover:text-white"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2 pb-6">
                <img
                    src={current.url}
                    alt={current.alt || alt}
                    className="max-h-full max-w-full object-contain"
                />

                {list.length > 1 && (
                    <>
                      <button
                          aria-label="Previous"
                          onClick={() => step(-1)}
                          className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                          aria-label="Next"
                          onClick={() => step(1)}
                          className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                )}
              </div>

              {list.length > 1 && (
                  <div className="flex justify-center gap-1.5 pb-6">
                    {list.map((_, i) => (
                        <button
                            key={i}
                            aria-label={`Image ${i + 1}`}
                            onClick={() => setActive(i)}
                            className={cn(
                                "h-1.5 rounded-full transition-all",
                                active === i ? "w-6 bg-white" : "w-1.5 bg-white/40",
                            )}
                        />
                    ))}
                  </div>
              )}
            </div>
        )}
      </>
  );
}