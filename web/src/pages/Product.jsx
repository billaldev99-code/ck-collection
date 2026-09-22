import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, fmtDA } from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

export default function Product() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const { add } = useCart();

  useEffect(() => { api.product(slug).then(setData).catch(() => {}); }, [slug]);
  if (!data) return <div className="container section">Chargement...</div>;
  const { product: p, related } = data;
  const images = p.images?.length ? p.images : [{ url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop" }];

  return (
    <div className="container section">
      <div style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
        <div>
          <img src={images[img]?.url} alt={p.name} style={{ borderRadius: 20, aspectRatio: "3/4", objectFit: "cover", width: "100%" }} />
          <div style={{ display: "flex", gap: ".5rem", marginTop: ".6rem" }}>
            {images.map((im, i) => (
              <img key={i} src={im.url} alt="" onClick={() => setImg(i)} style={{ width: 64, height: 80, objectFit: "cover", borderRadius: 10, border: i === img ? "2px solid var(--rose-deep)" : "1px solid var(--line)", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div className="fade-up">
          <p className="eyebrow">{p.category?.name || "C-K-Collection"}</p>
          <h1>{p.name}</h1>
          <p><span className="price" style={{ fontSize: "1.5rem" }}>{fmtDA(p.price)}</span>{p.oldPrice && <span className="old">{fmtDA(p.oldPrice)}</span>}</p>
          <p style={{ color: "#5b4d49" }}>{p.description || "Pièce élégante C-K-Collection, coupe soignée et tissu doux."}</p>
          {p.variants?.length > 0 && (
            <div><strong>Taille</strong><div style={{ display: "flex", gap: ".5rem", margin: ".5rem 0" }}>
              {[...new Set(p.variants.map((v) => v.size).filter(Boolean))].sort((a, b) => ["XS", "S", "M", "L", "XL", "XXL"].indexOf(a) - ["XS", "S", "M", "L", "XL", "XXL"].indexOf(b)).map((s) => (
                <button key={s} className={`btn ${size === s ? "btn-dark" : "btn-ghost"}`} onClick={() => setSize(s)}>{s}</button>
              ))}
            </div></div>
          )}
          <div style={{ display: "flex", gap: ".6rem", alignItems: "center", margin: "1rem 0" }}>
            <input className="input" type="number" min="1" max="20" value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ maxWidth: 90 }} />
            <button className="btn btn-rose" style={{ flex: 1 }} onClick={() => add(p, qty, size)}>Ajouter au panier 🛍</button>
          </div>
          <p style={{ fontSize: ".9rem", color: "var(--muted)" }}>✓ Paiement à la livraison · ✓ Livraison 68 wilayas · ✓ {p.stock > 0 ? "En stock" : "Stock limité"}</p>
        </div>
      </div>
      <h2 style={{ marginTop: "3rem" }}>Vous aimerez aussi</h2>
      <div className="grid-products" style={{ marginTop: "1rem" }}>{related?.map((r) => <ProductCard key={r.id} p={r} />)}</div>
    </div>
  );
}
