import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

const LEGACY_KEY = "ck_cart_v1";
// Panier séparé par compte : chaque cliente retrouve SON panier à la reconnexion.
// Invité (non connecté) : panier "guest" partagé de l'appareil.
const keyFor = (uid) => (uid ? `ck_cart_u_${uid}` : "ck_cart_guest");

function load(uid) {
  try {
    const raw = localStorage.getItem(keyFor(uid));
    if (raw) return JSON.parse(raw) || [];
    // reprise unique de l'ancien panier (avant les paniers par compte)
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      localStorage.removeItem(LEGACY_KEY);
      return JSON.parse(legacy) || [];
    }
    return [];
  } catch { return []; }
}

function save(uid, items) {
  try { localStorage.setItem(keyFor(uid), JSON.stringify(items)); } catch { /* stockage indisponible */ }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const uid = user?.id || null;
  const uidRef = useRef(uid);
  // Invité : panier vide en mémoire uniquement (vidé à chaque refresh).
  // Connecté : panier sauvegardé par compte, retrouvé à la reconnexion.
  const [items, setItems] = useState(() => (uid ? load(uid) : []));

  // sauvegarde à chaque changement, uniquement pour les comptes connectés
  useEffect(() => { if (uidRef.current) save(uidRef.current, items); }, [items]);

  // changement de compte :
  // - déconnexion → panier invité vide
  // - connexion → on charge uniquement le panier du compte (pas de fusion avec l'invité)
  useEffect(() => {
    const prev = uidRef.current;
    if (prev === uid) return;
    setItems(uid ? load(uid) : []);
    uidRef.current = uid;
  }, [uid]);

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
