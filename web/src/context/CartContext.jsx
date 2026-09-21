import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);
const KEY = "ck_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  const value = useMemo(() => ({
    items,
    count: items.reduce((a, i) => a + i.quantity, 0),
    subtotal: items.reduce((a, i) => a + i.price * i.quantity, 0),
    add(p, qty = 1, size = "", color = "") {
      const key = `${p.id}|${size}|${color}`;
      setItems((prev) => {
        const f = prev.find((i) => i.key === key);
        if (f) return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(20, i.quantity + qty) } : i));
        return [...prev, {
          key, productId: p.id, name: p.name, slug: p.slug, price: p.price,
          image: p.images?.[0]?.url || "", size, color, quantity: qty,
        }];
      });
    },
    setQty(key, q) { setItems((p) => q <= 0 ? p.filter((i) => i.key !== key) : p.map((i) => (i.key === key ? { ...i, quantity: q } : i))); },
    remove(key) { setItems((p) => p.filter((i) => i.key !== key)); },
    clear() { setItems([]); },
  }), [items]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
