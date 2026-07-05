import { api } from "@/lib/api";
import type {
  PlpResponse,
  ProductDetail,
  ProductSummary,
  ProductQuery,
  Gender,
} from "@/types/api";

export function buildProductQuery(q: ProductQuery): string {
  const p = new URLSearchParams();
  if (q.gender) p.set("gender", q.gender);
  if (q.category) p.set("category", q.category);
  if (q.categoryId) p.set("categoryId", q.categoryId);
  if (q.sizes?.length) p.set("sizes", q.sizes.join(","));
  if (q.colors?.length) p.set("colors", q.colors.join(","));
  if (q.brands?.length) p.set("brands", q.brands.join(","));
  if (q.minPrice != null) p.set("minPrice", String(q.minPrice));
  if (q.maxPrice != null) p.set("maxPrice", String(q.maxPrice));
  if (q.onSale) p.set("onSale", "true");
  if (q.isNew) p.set("isNew", "true");
  if (q.q) p.set("q", q.q);
  if (q.sort) p.set("sort", q.sort);
  if (q.limit != null) p.set("limit", String(q.limit));
  if (q.offset != null) p.set("offset", String(q.offset));
  return p.toString();
}

export const getProducts = (q: ProductQuery, signal?: AbortSignal) =>
  api.get<PlpResponse>(`/api/products?${buildProductQuery(q)}`, { signal });

export const getProduct = (slug: string, signal?: AbortSignal) =>
  api.get<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`, { signal });

export const getNewIn = (gender?: Gender, limit = 12) =>
  api.get<ProductSummary[]>(
    `/api/products/new-in?${new URLSearchParams({
      ...(gender ? { gender } : {}),
      limit: String(limit),
    })}`,
  );

export const getTrending = (gender?: Gender, limit = 12) =>
  api.get<ProductSummary[]>(
    `/api/products/trending?${new URLSearchParams({
      ...(gender ? { gender } : {}),
      limit: String(limit),
    })}`,
  );
