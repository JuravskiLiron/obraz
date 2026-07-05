import { api } from "@/lib/api";
import type { Wishlist } from "@/types/api";

export const getWishlist = () =>
  api.get<Wishlist>(`/api/wishlist`, { auth: true });

export const addWishlist = (productId: string) =>
  api.post<Wishlist>(`/api/wishlist`, { productId }, { auth: true });

export const removeWishlist = (productId: string) =>
  api.del<Wishlist>(
    `/api/wishlist/${encodeURIComponent(productId)}`,
    { auth: true },
  );
