import { api } from "@/lib/api";
import type { Brand, CategoryNode, SearchSuggestion, Gender } from "@/types/api";

export const getCategoryTree = (gender?: Gender) =>
  api.get<CategoryNode[]>(
    `/api/categories/tree${gender ? `?gender=${gender}` : ""}`,
  );

export const getBrands = () => api.get<Brand[]>(`/api/brands`);

export const suggest = (q: string, signal?: AbortSignal) =>
  api.get<SearchSuggestion>(
    `/api/search/suggest?q=${encodeURIComponent(q)}`,
    { signal },
  );
