/**
 * Tipos que reflejan las respuestas reales de la API Laravel (Tarea 12).
 *
 * OJO: Laravel serializa las columnas `decimal` como STRING ("1299.99"),
 * por eso price/total/unit_price/amount son `string`. Usa `toNumber()` de
 * `@/lib/money` cuando necesites calcular.
 */

export type User = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  image_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";
export type PaymentStatus = "pending" | "succeeded" | "failed";

export type Payment = {
  id: number;
  order_id: number;
  stripe_payment_intent_id: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  created_at?: string;
  updated_at?: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  /** Presente cuando la API hace `with('items.product')` */
  product?: Product | null;
};

export type Order = {
  id: number;
  user_id: number;
  total: string;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  /** Solo viene en GET /orders y GET /orders/{id} */
  payment?: Payment | null;
};

/* ---------- Respuestas de endpoints ---------- */

export type AuthResponse = {
  user: User;
  access_token: string;
  token_type: "bearer";
  /** segundos hasta que expira el JWT (JWT_TTL * 60) */
  expires_in: number;
};

export type PayResponse = {
  client_secret: string;
  payment: Payment;
};

export type ConfirmResponse = {
  order: Order;
  payment: Payment;
};

/* ---------- Cuerpos de request ---------- */

export type LoginInput = { email: string; password: string };

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type CreateOrderInput = {
  items: { product_id: number; quantity: number }[];
};

/* ---------- Errores ---------- */

/** Formato de error 422 de Laravel */
export type ValidationErrors = Record<string, string[]>;
