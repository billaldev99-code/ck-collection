import { Link } from "react-router-dom";
import { fmtDA } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const img = p.images?.[0]?.url || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop";
  return (
    <div className="card fade-up">
      <Link to={`/products/${p.slug}`}>
        <img className="card-img" src={img} alt={p.name} loading="lazy" />
      </Link>
      <div className="card-body">
        <div style={{ display: "flex", gap: ".4rem", marginBottom: ".4rem" }}>
          {p.isNew && <span className="badge rose">Nouveau</span>}
          {p.isPromo && <span className="badge gold">Promo</span>}
        </div>
        <Link to={`/products/${p.slug}`}><strong>{p.name}</strong></Link>
        <div style={{ margin: ".35rem 0 .7rem" }}>
          <span className="price">{fmtDA(p.price)}</span>
          {p.oldPrice && <span className="old">{fmtDA(p.oldPrice)}</span>}
        </div>
        <button className="btn btn-dark" style={{ width: "100%", padding: ".65rem" }} onClick={() => add(p)}>Ajouter ♥</button>
      </div>
    </div>
  );
}
