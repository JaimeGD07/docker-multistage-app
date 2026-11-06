import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { ApiError } from "@/lib/api/errors";
import { fetchProduct, fetchProducts } from "@/lib/api/products";
import type { Product } from "@/lib/api/types";

/**
 * Lecturas cacheadas del catalogo (publicas, no dependen del usuario).
 *
 * - `use cache` + `cacheTag('products')`: tras crear una orden (cambia el stock)
 *   las Server Actions llaman a `updateTag('products')` y el catalogo se refresca.
 * - cacheLife corto (revalidate 60 s): el stock puede cambiar con cada compra.
 * - Quien llama debe leer datos de la peticion antes (p. ej. `await connection()` o
 *   `params`) para que NO se ejecute durante `next build`.
 */

const CATALOG_LIFE = { stale: 30, revalidate: 60, expire: 240 } as const;

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheTag("products");
  cacheLife(CATALOG_LIFE);

  return fetchProducts();
}

/** Devuelve `null` si el producto no existe (404). Otros errores se propagan a error.tsx. */
export async function getProduct(id: number): Promise<Product | null> {
  "use cache";
  cacheTag("products", `product:${id}`);
  cacheLife(CATALOG_LIFE);

  try {
    return await fetchProduct(id);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
