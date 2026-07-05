import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  eager?: boolean;
}

// Lazy image with a shimmer placeholder and fade-in to avoid layout shift.
export function ProductImage({ src, alt, className, sizes, eager }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      {!loaded && (
        <span className="shimmer pointer-events-none absolute inset-0 bg-surface" />
      )}
      <img
        src={src}
        alt={alt}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
