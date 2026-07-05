import { api } from "@/lib/api";
import type { Cart, AddToCartRequest } from "@/types/api";

const opts = { auth: true, cartToken: true };

export const getCart = () => api.get<Cart>(`/api/cart`, opts);

export const addToCart = (body: AddToCartRequest) =>
  api.post<Cart>(`/api/cart/items`, body, opts);

export const updateCartItem = (sku: string, qty: number) =>
  api.put<Cart>(`/api/cart/items/${encodeURIComponent(sku)}`, { qty }, opts);

export const removeCartItem = (sku: string) =>
  api.del<Cart>(`/api/cart/items/${encodeURIComponent(sku)}`, opts);

export const mergeCart = (cartToken: string) =>
  api.post<Cart>(`/api/cart/merge`, { cartToken }, { auth: true });
