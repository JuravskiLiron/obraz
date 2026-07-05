import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { login, me, register } from "@/api/auth";
import { mergeCart } from "@/api/cart";
import { useAuthStore } from "@/store/authStore";
import { getCartToken } from "@/lib/storage";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/api";

async function afterAuth(qc: ReturnType<typeof useQueryClient>, res: AuthResponse) {
  useAuthStore.getState().signIn(res);
  // Fold the guest cart into the user's cart, if any.
  const token = getCartToken();
  if (token) {
    try {
      await mergeCart(token);
    } catch {
      /* nothing to merge */
    }
  }
  await qc.invalidateQueries({ queryKey: ["cart"] });
  await qc.invalidateQueries({ queryKey: ["wishlist"] });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: LoginRequest) => login(body),
    onSuccess: (res) => afterAuth(qc, res),
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: RegisterRequest) => register(body),
    onSuccess: (res) => afterAuth(qc, res),
  });
}

// Re-sync the persisted user with the server on app load.
export function useSyncUser() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        const u = await me();
        setUser(u);
        return u;
      } catch {
        signOut();
        return null;
      }
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
    retry: false,
  });
}
