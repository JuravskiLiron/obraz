import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/api/cart";
import type { AddToCartRequest, Cart } from "@/types/api";

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    staleTime: 15_000,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddToCartRequest) => addToCart(body),
    onSuccess: (cart) => qc.setQueryData(["cart"], cart),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sku, qty }: { sku: string; qty: number }) =>
      updateCartItem(sku, qty),
    onSuccess: (cart) => qc.setQueryData(["cart"], cart),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sku: string) => removeCartItem(sku),
    onSuccess: (cart: Cart) => qc.setQueryData(["cart"], cart),
  });
}
