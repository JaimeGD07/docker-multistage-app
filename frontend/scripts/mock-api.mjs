// API simulada SOLO para desarrollo/pruebas sin Docker. Imita el formato de la API Laravel real.
// Uso: node scripts/mock-api.mjs   (escucha en :8030, igual que docker-compose de la API)
import http from "node:http";

const products = [
  [1, "Laptop Gamer RTX 4060", "1299.99", 10, "laptop"],
  [2, "Mouse Inalámbrico Ergonómico", "29.90", 50, "mouse"],
  [3, "Teclado Mecánico RGB", "79.50", 3, "keyboard"],
  [4, 'Monitor 27" 144Hz', "329.00", 0, "monitor"],
  [5, "Audífonos Bluetooth Cancelación de Ruido", "149.99", 25, "headphones"],
].map(([id, name, price, stock, seed]) => ({
  id, name, description: `Descripción de ${name}`, price, stock,
  image_url: `http://localhost:8030/img/${seed}.svg`,
}));

const users = [
  { id: 1, name: "Demo Kodigo", email: "demo@kodigo.dev", password: "password123" },
  { id: 2, name: "Sesión Corta", email: "expira@kodigo.dev", password: "password123" },
];
const revoked = new Set();
const orders = [];
const intents = new Map(); // pi_<orden>_<n> -> estado del PaymentIntent simulado

const send = (res, status, body) => {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
};

const DELAY = Number(process.env.MOCK_DELAY_MS ?? 0); // simula API lenta para ver los esqueletos de carga

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  // Imagenes SVG generadas (solo para pruebas locales sin internet)
  const img = url.pathname.match(/^\/img\/(\w+)\.svg$/);
  if (img) {
    const hue = [...img[1]].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    return res.end(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},45%,22%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360},50%,12%)"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/><rect x="130" y="95" width="140" height="110" rx="10" fill="none" stroke="hsl(${hue},60%,70%)" stroke-width="4"/><circle cx="200" cy="150" r="22" fill="hsl(${hue},60%,70%)"/></svg>`);
  }
    if (req.headers.accept !== "application/json")
    return send(res, 500, { message: "Falta Accept: application/json" });

  if (DELAY && url.pathname.startsWith("/api/products")) await new Promise((r) => setTimeout(r, DELAY));

  if (url.pathname === "/api/products") return send(res, 200, products);
  const m = url.pathname.match(/^\/api\/products\/(\d+)$/);
  if (m) {
    const p = products.find((x) => x.id === Number(m[1]));
    return p ? send(res, 200, p) : send(res, 404, { message: "No query results for model [App\\Models\\Product]" });
  }
  // ---- Autenticacion simulada (formato de la API Laravel + JWT) ----
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const makeJwt = (sub, ttl) =>
    `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + ttl })}.mocksig`;
  const userFromToken = () => {
    const t = (req.headers.authorization ?? "").replace(/^Bearer /, "");
    try {
      const p = JSON.parse(Buffer.from(t.split(".")[1], "base64url").toString());
      if (p.exp * 1000 <= Date.now() || revoked.has(t)) return null;
      return users.find((u) => u.id === p.sub) ?? null;
    } catch { return null; }
  };
  const readBody = async () => {
    let raw = "";
    for await (const c of req) raw += c;
    try { return JSON.parse(raw || "{}"); } catch { return {}; }
  };
  const authOk = (user, ttl = 3600, jwtTtl = ttl) =>
    ({ user: { id: user.id, name: user.name, email: user.email }, access_token: makeJwt(user.id, jwtTtl), token_type: "bearer", expires_in: ttl });

  if (url.pathname === "/api/auth/login" && req.method === "POST") {
    const { email, password } = await readBody();
    const u = users.find((x) => x.email === email && x.password === password);
    if (!u) return send(res, 401, { message: "Credenciales inválidas" });
    // expira@: el JWT vence a los 6 s pero la cookie dura 1 h (prueba del chequeo de expiracion)
    return send(res, 200, authOk(u, 3600, u.email.startsWith("expira") ? 6 : 3600));
  }
  if (url.pathname === "/api/auth/register" && req.method === "POST") {
    const { name, email, password, password_confirmation } = await readBody();
    const errors = {};
    if (!name) errors.name = ["The name field is required."];
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = ["The email field must be a valid email address."];
    else if (users.some((x) => x.email === email)) errors.email = ["The email has already been taken."];
    if (!password || password.length < 8) errors.password = ["The password field must be at least 8 characters."];
    else if (password !== password_confirmation) errors.password = ["The password field confirmation does not match."];
    if (Object.keys(errors).length) return send(res, 422, { message: "The given data was invalid.", errors });
    const u = { id: users.length + 1, name, email, password };
    users.push(u);
    return send(res, 201, authOk(u));
  }
  if (url.pathname === "/api/auth/me") {
    const u = userFromToken();
    return u ? send(res, 200, { id: u.id, name: u.name, email: u.email }) : send(res, 401, { message: "Unauthenticated." });
  }
  if (url.pathname === "/api/auth/logout" && req.method === "POST") {
    if (!userFromToken()) return send(res, 401, { message: "Unauthenticated." });
    revoked.add((req.headers.authorization ?? "").replace(/^Bearer /, ""));
    return send(res, 200, { message: "Sesión cerrada correctamente" });
  }
  // ---- Ordenes simuladas (mismo formato y reglas que OrderController de Laravel) ----
  if (url.pathname === "/__set-stock" && req.method === "POST") {
    const { id, stock } = await readBody(); // gancho SOLO para pruebas
    products.find((x) => x.id === id).stock = stock;
    return send(res, 200, { ok: true });
  }
  if (url.pathname === "/__state") // gancho SOLO para pruebas
    return send(res, 200, orders.map((o) => ({ id: o.id, status: o.status, payments: o.payments?.length ?? 0, confirmHits: o.confirmHits ?? 0 })));
  if (url.pathname === "/__intent-succeeded" && req.method === "POST") {
    const { secret } = await readBody(); // "pi_<orden>_<n>_secret_mock" -> el "cliente" pago con exito
    intents.set(String(secret).replace(/_secret_mock$/, ""), "succeeded");
    return send(res, 200, { ok: true });
  }
  if (url.pathname.startsWith("/api/orders")) {
    const u = userFromToken();
    if (!u) return send(res, 401, { message: "Unauthenticated." });
    if (url.pathname === "/api/orders" && req.method === "POST") {
      const { items } = await readBody();
      if (!Array.isArray(items) || items.length === 0)
        return send(res, 422, { message: "The items field is required.", errors: { items: ["The items field is required."] } });
      for (const [i, it] of items.entries()) {
        if (!products.some((x) => x.id === it.product_id))
          return send(res, 422, { message: "The selected items.0.product_id is invalid.", errors: { [`items.${i}.product_id`]: ["The selected product is invalid."] } });
      }
      let total = 0;
      for (const it of items) {
        const p = products.find((x) => x.id === it.product_id);
        if (p.stock < it.quantity) return send(res, 422, { message: `Stock insuficiente para el producto: ${p.name}` });
        total += Number(p.price) * it.quantity;
      }
      const id = orders.length + 1;
      const order = {
        id, user_id: u.id, total: total.toFixed(2), status: "pending", created_at: new Date().toISOString(),
        items: items.map((it, n) => {
          const p = products.find((x) => x.id === it.product_id);
          p.stock -= it.quantity;
          return { id: id * 10 + n, order_id: id, product_id: p.id, quantity: it.quantity, unit_price: p.price, product: { ...p } };
        }),
        payment: null,
      };
      orders.push(order);
      return send(res, 201, order);
    }
    const pm = url.pathname.match(/^\/api\/orders\/(\d+)\/(pay|confirm)$/);
    if (pm && req.method === "POST") {
      const o = orders.find((x) => x.id === Number(pm[1]));
      if (!o) return send(res, 404, { message: "No query results for model [App\\Models\\Order]" });
      if (o.user_id !== u.id)
        return send(res, 403, { message: pm[2] === "pay" ? "No autorizado para pagar esta orden" : "No autorizado para confirmar esta orden" });
      o.payments ??= [];
      if (pm[2] === "pay") {
        if (o.status !== "pending") return send(res, 422, { message: "Esta orden ya fue procesada" });
        // Igual que PaymentController::createIntent: SIEMPRE crea un intento y un registro nuevos
        const n = o.payments.length + 1;
        const piId = `pi_${o.id}_${n}`;
        intents.set(piId, "requires_payment_method");
        const payment = { id: o.id * 100 + n, order_id: o.id, stripe_payment_intent_id: piId, amount: o.total, currency: "usd", status: "pending" };
        o.payments.push(payment);
        o.payment = o.payments[0]; // hasOne() devuelve el PRIMER registro
        return send(res, 200, { client_secret: `${piId}_secret_mock`, payment });
      }
      o.confirmHits = (o.confirmHits ?? 0) + 1;
      // confirm: revisa solo el primer intento y, si no esta pagado, deja la orden en "failed"
      const first = o.payments[0];
      if (!first) return send(res, 404, { message: "No existe un intento de pago para esta orden" });
      const ok = intents.get(first.stripe_payment_intent_id) === "succeeded";
      first.status = ok ? "succeeded" : "failed";
      o.status = ok ? "paid" : "failed";
      return send(res, 200, { order: { ...o, payments: undefined }, payment: first });
    }
    if (url.pathname === "/api/orders" && req.method === "GET")
      return send(res, 200, orders.filter((o) => o.user_id === u.id).reverse());
    const om = url.pathname.match(/^\/api\/orders\/(\d+)$/);
    if (om && req.method === "GET") {
      const o = orders.find((x) => x.id === Number(om[1]));
      if (!o) return send(res, 404, { message: "No query results for model [App\\Models\\Order]" });
      if (o.user_id !== u.id) return send(res, 403, { message: "No autorizado para ver esta orden" });
      return send(res, 200, { ...o, payments: undefined, confirmHits: undefined });
    }
  }
  send(res, 404, { message: "Not found" });
}).listen(8030, () => console.log("mock api on :8030"));
