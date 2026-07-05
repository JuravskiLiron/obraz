import {
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  getNewIn,
  getTrending,
} from "@/api/products";
import type { Gender, PlpResponse, ProductQuery } from "@/types/api";

const PAGE_SIZE = 24;

// Stable key from everything except the paging offset.
function listKey(q: ProductQuery) {
  const { offset: _o, ...rest } = q;
  return ["products", rest] as const;
}

export function useProductList(query: ProductQuery) {
  return useInfiniteQuery({
    queryKey: listKey(query),
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      getProducts({ ...query, limit: PAGE_SIZE, offset: pageParam }, signal),
    getNextPageParam: (last: PlpResponse) =>
      last.hasMore ? last.offset + last.limit : undefined,
  });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: ({ signal }) => getProduct(slug!, signal),
    enabled: !!slug,
  });
}

export function useNewIn(gender?: Gender, limit = 12) {
  return useQuery({
    queryKey: ["new-in", gender ?? "all", limit],
    queryFn: () => getNewIn(gender, limit),
  });
}

export function useTrending(gender?: Gender, limit = 12) {
  return useQuery({
    queryKey: ["trending", gender ?? "all", limit],
    queryFn: () => getTrending(gender, limit),
  });
}
