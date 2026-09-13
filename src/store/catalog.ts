import { useQuery } from "@tanstack/react-query";
import { fetchAllProducts, fetchCollections, fetchProducts } from "@/services/db";
import type { Product } from "@/services/catalog";

export const productsQueryKey = ["products"] as const;
export const adminProductsQueryKey = ["products", "all"] as const;
export const collectionsQueryKey = ["collections"] as const;

/** Published catalog, shared by every storefront surface. */
export function useProducts(): Product[] {
  const { data } = useQuery({
    queryKey: productsQueryKey,
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
  return data ?? [];
}

export function useProductsQuery() {
  return useQuery({ queryKey: productsQueryKey, queryFn: fetchProducts, staleTime: 60_000 });
}

export function useAdminProducts(enabled: boolean) {
  return useQuery({
    queryKey: adminProductsQueryKey,
    queryFn: fetchAllProducts,
    enabled,
    staleTime: 10_000,
  });
}

export function useCollections() {
  const { data } = useQuery({
    queryKey: collectionsQueryKey,
    queryFn: fetchCollections,
    staleTime: 60_000,
  });
  return data ?? [];
}
