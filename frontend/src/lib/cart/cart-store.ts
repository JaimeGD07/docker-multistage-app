/**
 * Almacen del carrito: vive en el navegador (localStorage) y se expone a React con
 * useSyncExternalStore (ver cart-provider.tsx). Solo guarda lo necesario para mostrar
 * el carrito; el servidor NUNCA confia en estos precios: la API recalcula el total.
 */
export type CartItem = {
  productId: number;
  name: string;
  /** Precio unitario como lo entrega la API (string decimal) */
  price: string;
  imageUrl: string | null;
  /** Stock conocido al agregar; se usa para limitar el selector de cantidad */
  stock: number;
  quantity: number;
};

export type CartProductInput = Omit<CartItem, "quantity">;

const STORAGE_KEY = "kt_cart_v1";
export const MAX_PER_LINE = 99;

const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isCartItem(v: unknown): v is CartItem {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    Number.isInteger(o.productId) &&
    typeof o.name === "string" &&
    typeof o.price === "string" &&
    (o.imageUrl === null || typeof o.imageUrl === "string") &&
    Number.isInteger(o.stock) &&
    Number.isInteger(o.quantity) &&
    (o.quantity as number) >= 1
  );
}

function readStorage(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const valid = parsed.filter(isCartItem);
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY; // JSON danado o storage bloqueado: se empieza con carrito vacio
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: CartItem[]) {
  items = next.length ? next : EMPTY;
  try {
    if (items.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage lleno o bloqueado: el carrito sigue funcionando en memoria
  }
  emit();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    // Sincroniza varias pestanas abiertas
    if (e.key === STORAGE_KEY || e.key === null) {
      items = readStorage();
      emit();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function getSnapshot(): CartItem[] {
  if (!loaded) {
    items = readStorage();
    loaded = true;
  }
  return items;
}

/** En el servidor (y durante la hidratacion) el carrito siempre esta vacio */
export function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

/** Agrega unidades respetando el stock. Devuelve true si la linea quedo en su limite. */
export function addItem(product: CartProductInput, quantity = 1): boolean {
  const current = getSnapshot();
  const limit = Math.max(0, Math.min(product.stock, MAX_PER_LINE));
  const existing = current.find((i) => i.productId === product.productId);

  if (existing) {
    const nextQty = Math.min(existing.quantity + quantity, limit);
    commit(
      current.map((i) =>
        i.productId === product.productId
          ? { ...i, ...product, quantity: nextQty }
          : i,
      ),
    );
    return nextQty >= limit;
  }

  if (limit < 1) return true;
  const nextQty = Math.min(quantity, limit);
  commit([...current, { ...product, quantity: nextQty }]);
  return nextQty >= limit;
}

export function setQuantity(productId: number, quantity: number) {
  const current = getSnapshot();
  const line = current.find((i) => i.productId === productId);
  if (!line) return;
  const limit = Math.max(1, Math.min(line.stock, MAX_PER_LINE));
  const q = Math.min(Math.max(Math.trunc(quantity) || 1, 1), limit);
  commit(current.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)));
}

export function removeItem(productId: number) {
  commit(getSnapshot().filter((i) => i.productId !== productId));
}

export function clearCart() {
  commit(EMPTY);
}
