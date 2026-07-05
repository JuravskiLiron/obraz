import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";
import { useAuthStore } from "@/store/authStore";
import { HomePage } from "@/pages/HomePage";
import { ListingPage } from "@/pages/ListingPage";
import { ProductPage } from "@/pages/ProductPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { WishlistPage } from "@/pages/WishlistPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { AccountPage } from "@/pages/AccountPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderDetailPage } from "@/pages/OrderDetailPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { AdminLayout } from "@/pages/admin/AdminLayout";
import { AdminProductsPage } from "@/pages/admin/AdminProductsPage";
import { AdminProductEditPage } from "@/pages/admin/AdminProductEditPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";

function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();
  if (!isAuthed)
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },

      { path: "women", element: <ListingPage gender="women" /> },
      { path: "women/:categorySlug", element: <ListingPage gender="women" /> },
      { path: "men", element: <ListingPage gender="men" /> },
      { path: "men/:categorySlug", element: <ListingPage gender="men" /> },
      { path: "search", element: <ListingPage search /> },

      { path: "product/:slug", element: <ProductPage /> },
      { path: "cart", element: <CartPage /> },
      {
        path: "checkout",
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      { path: "wishlist", element: <WishlistPage /> },

      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },

      {
        path: "account",
        element: (
          <RequireAuth>
            <AccountPage />
          </RequireAuth>
        ),
      },
      {
        path: "account/orders",
        element: (
          <RequireAuth>
            <OrdersPage />
          </RequireAuth>
        ),
      },
      {
        path: "account/orders/:id",
        element: (
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        ),
      },

      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/products" replace /> },
          { path: "products", element: <AdminProductsPage /> },
          { path: "products/new", element: <AdminProductEditPage /> },
          { path: "products/:slug/edit", element: <AdminProductEditPage /> },
          { path: "orders", element: <AdminOrdersPage /> },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
