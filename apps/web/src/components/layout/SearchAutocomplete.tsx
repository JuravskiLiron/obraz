import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSuggest } from "@/hooks/useCatalog";
import { formatPrice } from "@/lib/utils";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";

export function SearchAutocomplete({
  onNavigate,
  autoFocus,
}: {
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const debounced = useDebouncedValue(term, 300);
  const { data, isFetching } = useSuggest(debounced);
  const navigate = useNavigate();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  const go = (path: string) => {
    setOpen(false);
    onNavigate?.();
    navigate(path);
  };

  const submit = () => {
    const q = term.trim();
    if (q.length > 0) go(`/search?q=${encodeURIComponent(q)}`);
  };

  const hasResults =
    !!data &&
    (data.products.length > 0 ||
      data.brands.length > 0 ||
      data.categories.length > 0);

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 border-b border-fg/80 px-1 py-2">
        <SearchIcon className="h-5 w-5 shrink-0 text-muted" />
        <input
          ref={ref}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Search for items and brands"
          className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
          autoComplete="off"
        />
        {isFetching && <Spinner className="h-4 w-4 text-muted" />}
        {term && (
          <button
            aria-label="Clear search"
            onClick={() => {
              setTerm("");
              ref.current?.focus();
            }}
            className="text-muted hover:text-fg"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && debounced.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto border border-line bg-bg shadow-lg">
          {!hasResults && !isFetching && (
            <p className="px-4 py-6 text-center text-sm text-muted">
              No matches for “{debounced}”.
            </p>
          )}

          {data?.categories.length ? (
            <div className="border-b border-line p-2">
              {data.categories.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => go(`/${c.gender}/${c.slug}`)}
                  className="block w-full px-2 py-1.5 text-left text-sm hover:bg-surface"
                >
                  <span className="text-muted">in </span>
                  {c.name}
                </button>
              ))}
            </div>
          ) : null}

          {data?.brands.length ? (
            <div className="border-b border-line p-2">
              {data.brands.slice(0, 4).map((b) => (
                <button
                  key={b.id}
                  onClick={() => go(`/search?q=${encodeURIComponent(b.name)}`)}
                  className="block w-full px-2 py-1.5 text-left text-sm font-medium hover:bg-surface"
                >
                  {b.name}
                </button>
              ))}
            </div>
          ) : null}

          {data?.products.length ? (
            <ul className="p-2">
              {data.products.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => go(`/product/${p.slug}`)}
                    className="flex w-full items-center gap-3 rounded-token px-2 py-2 text-left hover:bg-surface"
                  >
                    <img
                      src={p.colors[0]?.images[0]?.url}
                      alt=""
                      className="h-14 w-11 shrink-0 object-cover"
                      loading="lazy"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] uppercase tracking-wide text-muted">
                        {p.brand}
                      </span>
                      <span className="block truncate text-sm">{p.name}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatPrice(p.salePrice ?? p.price, p.currency)}
                    </span>
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={submit}
                  className="mt-1 block w-full px-2 py-2 text-center text-[13px] font-semibold uppercase tracking-wide text-fg hover:bg-surface"
                >
                  See all results
                </button>
              </li>
            </ul>
          ) : null}
        </div>
      )}
    </div>
  );
}
