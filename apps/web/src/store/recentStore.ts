import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductSummary } from "@/types/api";

interface RecentState {
  items: ProductSummary[];
  add: (p: ProductSummary) => void;
}

const MAX = 12;

export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => ({
          items: [p, ...s.items.filter((x) => x.id !== p.id)].slice(0, MAX),
        })),
    }),
    { name: "farax.recent" },
  ),
);
