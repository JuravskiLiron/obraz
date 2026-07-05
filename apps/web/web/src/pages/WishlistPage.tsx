import { useNavigate } from "react-router-dom";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuthStore } from "@/store/authStore";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/common/EmptyState";

export function WishlistPage() {
  const isAuthed = useAuthStore((s) => s.isAuthenticated);
  const { data, isLoading } = useWishlist();
  const navigate = useNavigate();

  if (!isAuthed)
    return (
      <EmptyState
        title="Sign in to view saved items"
        description="Your saved items are kept in your account."
        action={<Button onClick={() => navigate("/login")}>Sign in</Button>}
      />
    );

  if (isLoading)
    return (
      <div className="grid place-items-center py-32">
        <Spinner />
      </div>
    );

  if (!data || data.items.length === 0)
    return (
      <EmptyState
        title="No saved items yet"
        description="Tap the heart on any product to save it for later."
        action={<Button onClick={() => navigate("/")}>Start shopping</Button>}
      />
    );

  return (
    <div className="container-px py-8">
      <h1 className="mb-6 font-display text-2xl font-extrabold uppercase tracking-tight">
        Saved items ({data.items.length})
      </h1>
      <ProductGrid products={data.items} />
    </div>
  );
}
