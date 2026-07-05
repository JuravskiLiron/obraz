// Types mirror the backend DTOs (camelCase JSON). Keep in sync with apps/api.

export type Gender = "women" | "men" | "unisex";
export type ProductSort = "recommended" | "newIn" | "priceAsc" | "priceDesc";

export interface ImageDto {
  url: string;
  alt: string;
}

export interface ColorDto {
  name: string;
  hex: string;
  images: ImageDto[];
}

export interface VariantDto {
  sku: string;
  color: string;
  size: string;
  stock: number;
  price: number;
  salePrice?: number | null;
}

export interface AttributesDto {
  fit: string;
  fabric: string;
  care: string;
  modelInfo: string;
  lengthCm?: number | null;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  brand: string;
  gender: Gender;
  categoryId: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  colors: ColorDto[];
  sizes: string[];
  isNew: boolean;
  onSale: boolean;
  lowStock: boolean;
  totalStock: number;
  rating?: number | null;
  reviewsCount?: number | null;
}

export interface ProductDetail {
  id: string;
  slug: string;
  name: string;
  brand: string;
  brandId: string;
  gender: Gender;
  categoryId: string;
  description: string;
  colors: ColorDto[];
  variants: VariantDto[];
  price: number;
  salePrice?: number | null;
  currency: string;
  attributes: AttributesDto;
  tags: string[];
  isNew: boolean;
  onSale: boolean;
  rating?: number | null;
  reviewsCount?: number | null;
  related: ProductSummary[];
}

export interface FacetBucket {
  value: string;
  hex?: string | null;
  count: number;
}

export interface Facets {
  sizes: FacetBucket[];
  colors: FacetBucket[];
  brands: FacetBucket[];
  minPrice: number;
  maxPrice: number;
}

export interface PlpResponse {
  items: ProductSummary[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  facets: Facets;
}

export interface CategoryNode {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  gender: Gender;
  order: number;
  image: string;
  children: CategoryNode[];
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string;
  description: string;
}

export interface SearchSuggestion {
  products: ProductSummary[];
  brands: Brand[];
  categories: CategoryNode[];
}

export interface Address {
  label: string;
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string; // "customer" | "admin"
  addresses: Address[];
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  user: User;
}

export interface CartItem {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  color: string;
  size: string;
  image: string;
  qty: number;
  price: number;
  stock: number;
}

export interface Cart {
  id: string;
  userId?: string | null;
  cartToken?: string | null;
  items: CartItem[];
  subtotal: number;
  count: number;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: ProductSummary[];
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  productId: string;
  sku: string;
  name: string;
  brand: string;
  color: string;
  size: string;
  image: string;
  qty: number;
  price: number;
}

export type DeliveryMethod = "standard" | "express" | "pickupPoint";

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentStatus: string;
  currency: string;
  createdAt: string;
}

// ---- request payloads ----
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AddToCartRequest {
  productId: string;
  sku: string;
  qty: number;
}
export interface CreateOrderRequest {
  shippingAddress: ShippingAddress;
  deliveryMethod: string;
}

// ---- PLP query model (frontend-side) ----
export interface ProductQuery {
  gender?: Gender;
  category?: string; // slug
  categoryId?: string;
  sizes?: string[];
  colors?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  isNew?: boolean;
  q?: string;
  sort?: ProductSort;
  limit?: number;
  offset?: number;
}
