import { useQuery } from "@tanstack/react-query";
import { getBrands, getCategoryTree, suggest } from "@/api/catalog";
import type { Gender } from "@/types/api";

export function useCategoryTree(gender?: Gender) {
  return useQuery({
    queryKey: ["categories", gender ?? "all"],
    queryFn: () => getCategoryTree(gender),
    staleTime: 10 * 60_000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 10 * 60_000,
  });
}

export function useSuggest(term: string) {
  return useQuery({
    queryKey: ["suggest", term],
    queryFn: ({ signal }) => suggest(term, signal),
    enabled: term.trim().length >= 2,
    staleTime: 30_000,
  });
}
