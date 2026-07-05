import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Gender } from "@/types/api";

type Drawer = "cart" | "search" | "menu" | "filter" | null;

interface UiState {
  gender: Exclude<Gender, "unisex">;
  setGender: (g: Exclude<Gender, "unisex">) => void;
  drawer: Drawer;
  openDrawer: (d: Exclude<Drawer, null>) => void;
  closeDrawer: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      gender: "women",
      setGender: (gender) => set({ gender }),
      drawer: null,
      openDrawer: (drawer) => set({ drawer }),
      closeDrawer: () => set({ drawer: null }),
    }),
    {
      name: "farax.ui",
      partialize: (s) => ({ gender: s.gender }),
    },
  ),
);
