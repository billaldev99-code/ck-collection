import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fmtDA } from "../services/api";

export default function Cart() {
  const { items, setQty, remove, subtotal } = useCart();
  const nav = useNavigate();
  if (!items.length) return <div className="container section" style={{ textAlign: "center" }}><h1>Votre panier est vide</h1><p>Découvrez nos nouveautés ♡</p><Link to="/shop" className="btn btn-dark">Voir la boutique</Link></div>;
  return (
    <div className="container section">
      <h1>Panier ({items.length})</h1>
      <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {items.map((i) => (
          <div key={i.key} className="card" style={{ display: "flex", gap: "1rem", padding: "1rem", alignItems: "center" }}>
            <img src={i.image} alt={i.name} style={{ width: 84, height: 104, objectFit: "cover", borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <Link to={`/products/${i.slug}`}><strong>{i.name}</strong></Link>
              <div style={{ fontSize: ".85rem", color: "var(--muted)" }}>{i.size} {i.color}</div>
              <div style={{ display: "flex", gap: ".5rem", alignItems: "center", marginTop: ".4rem" }}>
                <button className="icon-btn" onClick={() => setQty(i.key, i.quantity - 1)}>−</button>
                <strong>{i.quantity}</strong>
                <button className="icon-btn" onClick={() => setQty(i.key, i.quantity + 1)}>+</button>
                <button onClick={() => remove(i.key)} style={{ background: "none", border: 0, cursor: "pointer", color: "var(--rose-deep)" }}>Supprimer</button>
              </div>
            </div>
            <strong>{fmtDA(i.price * i.quantity)}</strong>
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: "1.4rem", marginTop: "1.2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sous-total</span><strong>{fmtDA(subtotal)}</strong></div>
        <small style={{ color: "var(--muted)" }}>Livraison calculée à la commande selon wilaya.</small>
        <div style={{ display: "flex", gap: ".7rem", marginTop: "1rem", flexWrap: "wrap" }}>
          <Link to="/shop" className="btn btn-ghost">Continuer mes achats</Link>
          <button className="btn btn-dark" onClick={() => nav("/checkout")}>Passer la commande →</button>
        </div>
      </div>
    </div>
  );
}
