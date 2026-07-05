import { api } from "@/lib/api";
import type { Order, ProductDetail } from "@/types/api";

export interface AdminProductRequest {
  slug: string;
  name: string;
  brand: string;
  brandId: string;
  gender: string;
  categoryId: string;
  description: string;
  colors: { name: string; hex: string; images: { url: string; alt: string }[] }[];
  variants: {
    sku: string;
    color: string;
    size: string;
    stock: number;
    price: number;
    salePrice?: number | null;
  }[];
  price: number;
  salePrice?: number | null;
  currency: string;
  attributes: {
    fit: string;
    fabric: string;
    care: string;
    modelInfo: string;
    lengthCm?: number | null;
  };
  tags: string[];
  isNew: boolean;
  isActive: boolean;
}

export const adminCreateProduct = (body: AdminProductRequest) =>
  api.post<ProductDetail>(`/api/admin/products`, body, { auth: true });

export const adminUpdateProduct = (id: string, body: AdminProductRequest) =>
  api.put<ProductDetail>(
    `/api/admin/products/${encodeURIComponent(id)}`,
    body,
    { auth: true },
  );

export const adminDeleteProduct = (id: string) =>
  api.del<void>(`/api/admin/products/${encodeURIComponent(id)}`, { auth: true });

export const adminGetOrders = () =>
  api.get<Order[]>(`/api/admin/orders`, { auth: true });

export const adminUpdateOrderStatus = (id: string, status: string) =>
  api.put<Order>(
    `/api/admin/orders/${encodeURIComponent(id)}/status`,
    { status },
    { auth: true },
  );
