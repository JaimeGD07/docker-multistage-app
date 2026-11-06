import "server-only";
import { apiFetch } from "./client";
import type { Product } from "./types";

/**
 * Lecturas PUBLICAS (no necesitan token). Estas funciones hacen la peticion
 * "en crudo"; en la Fase 2 las envolvemos con `use cache` + `cacheTag('products')`.
 */

export function fetchProducts(): Promise<Product[]> {
  return apiFetch<Product[]>("/products");
}

export function fetchProduct(id: number | string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}
