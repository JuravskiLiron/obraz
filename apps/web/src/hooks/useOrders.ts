import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { checkout, getOrder, getOrders } from "@/api/orders";
import type { CreateOrderRequest } from "@/types/api";

export function useOrders() {
  return useQuery({ queryKey: ["orders"], queryFn: getOrders });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderRequest) => checkout(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
