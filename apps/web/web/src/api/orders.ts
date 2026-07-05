import { api } from "@/lib/api";
import type { Order, CreateOrderRequest } from "@/types/api";

export const checkout = (body: CreateOrderRequest) =>
  api.post<Order>(`/api/orders/checkout`, body, { auth: true });

export const getOrders = () => api.get<Order[]>(`/api/orders`, { auth: true });

export const getOrder = (id: string) =>
  api.get<Order>(`/api/orders/${encodeURIComponent(id)}`, { auth: true });
