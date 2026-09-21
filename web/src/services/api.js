const API = import.meta.env.VITE_API_URL || "http://localhost:4001/api";

function authHeader() {
  const t = localStorage.getItem("ck_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function req(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json", ...authHeader(), ...(opts.headers || {}) },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Erreur");
  return data;
}

export const api = {
  products: (qs = "") => req(`/products${qs}`),
  product: (slug) => req(`/products/${slug}`),
  categories: () => req(`/categories`),
  createOrder: (body) => req(`/orders`, { method: "POST", body: JSON.stringify(body) }),
  register: (b) => req(`/auth/register`, { method: "POST", body: JSON.stringify(b) }),
  login: (b) => req(`/auth/login`, { method: "POST", body: JSON.stringify(b) }),
  me: () => req(`/auth/me`),
  contact: (b) => req(`/contact`, { method: "POST", body: JSON.stringify(b) }),
  // admin
  admin: {
    stats: () => req(`/stats`),
    orders: (qs = "") => req(`/orders${qs}`),
    setStatus: (id, status) => req(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
    createProduct: (b) => req(`/products`, { method: "POST", body: JSON.stringify(b) }),
    updateProduct: (id, b) => req(`/products/${id}`, { method: "PUT", body: JSON.stringify(b) }),
    deleteProduct: (id) => req(`/products/${id}`, { method: "DELETE" }),
    createCategory: (b) => req(`/categories`, { method: "POST", body: JSON.stringify(b) }),
    users: () => req(`/users`),
  },
};

export const fmtDA = (centimes) =>
  new Intl.NumberFormat("fr-DZ").format(Math.round((centimes || 0) / 100)) + " DA";
