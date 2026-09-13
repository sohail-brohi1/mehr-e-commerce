import { api } from "@/services/api";
import type { CategorySlug, ColorOption, Product } from "@/services/catalog";

export type Collection = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  imagePath: string;
  sortOrder: number;
};

export type ProductInput = {
  slug: string;
  name: string;
  sku: string;
  description: string;
  story: string;
  price: number;
  sale_price: number | null;
  category: CategorySlug;
  collection_slug: string | null;
  sizes: string[];
  colors: ColorOption[];
  images: string[];
  frames_360: string[];
  model_url: string | null;
  size_guide_url: string | null;
  fabric: string;
  fit: string;
  care: string;
  origin: string;
  stock: number;
  featured: boolean;
  new_arrival: boolean;
  published: boolean;
  sort_order: number;
};

export async function fetchProducts(): Promise<Product[]> {
  return api<Product[]>("/products");
}

export async function fetchAllProducts(): Promise<Product[]> {
  return api<Product[]>("/products/all");
}

export async function fetchCollections(): Promise<Collection[]> {
  return api<Collection[]>("/collections");
}

export async function saveProduct(input: ProductInput, id?: string) {
  if (id) {
    const data = await api<{ id: string }>("/products/" + id, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return data.id;
  }
  const data = await api<{ id: string }>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.id;
}

export async function deleteProduct(id: string) {
  await api("/products/" + id, { method: "DELETE" });
}

export async function patchProduct(
  id: string,
  patch: Partial<Pick<ProductInput, "stock" | "featured" | "new_arrival" | "published">>,
) {
  await api("/products/" + id, { method: "PATCH", body: JSON.stringify(patch) });
}

export async function saveCollection(
  input: {
    slug: string;
    name: string;
    tagline: string;
    description: string;
    image_url: string | null;
    sort_order: number;
  },
  id?: string,
) {
  if (id) {
    const data = await api<{ id: string }>("/collections/" + id, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    return data.id;
  }
  const data = await api<{ id: string }>("/collections", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.id;
}

export async function deleteCollection(id: string) {
  await api("/collections/" + id, { method: "DELETE" });
}

export const slugify = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
