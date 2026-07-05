import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { addWishlist, getWishlist, removeWishlist } from "@/api/wishlist";
import { useAuthStore } from "@/store/authStore";
import type { Wishlist } from "@/types/api";

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, active }: { productId: string; active: boolean }) =>
      active ? removeWishlist(productId) : addWishlist(productId),
    onSuccess: (wl: Wishlist) => qc.setQueryData(["wishlist"], wl),
  });
}

export function useIsWishlisted(productId: string): boolean {
  const { data } = useWishlist();
  return !!data?.items.some((p) => p.id === productId);
}
