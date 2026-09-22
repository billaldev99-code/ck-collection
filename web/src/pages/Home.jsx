import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

const CATS = [
  { name: "Robes", slug: "robes", img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop" },
  { name: "Ensembles", slug: "ensembles", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop" },
  { name: "Pyjamas", slug: "pyjamas", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600&auto=format&fit=crop" },
  { name: "Nouveautés", slug: "", img: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop" },
];

export default function Home() {
  const [fresh, setFresh] = useState([]);
  useEffect(() => { api.products("?limit=8&sort=new").then((d) => setFresh(d.items)).catch(() => {}); }, []);
  return (
    <div className="container">
      <section className="hero fade-up">
        <div className="hero-text">
          <p className="eyebrow">Nouvelle collection 2026</p>
          <h1>C-K-Collection<br /><em style={{ color: "#A8616A" }}>Découvrez votre style.</em></h1>
          <p style={{ color: "#5b4d49", maxWidth: 440 }}>Robes, ensembles, pyjamas & tenues chic — une élégance douce, pensée pour chaque femme.</p>
          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", marginTop: "1.4rem" }}>
            <Link to="/shop" className="btn btn-dark">Découvrir la collection</Link>
            <Link to="/shop?isNew=true" className="btn btn-ghost">Voir les nouveautés</Link>
          </div>
        </div>
        <div className="hero-img" role="img" aria-label="Mode féminine C-K-Collection" />
      </section>

      <section className="section">
        <p className="eyebrow">Nos univers</p>
        <h2>Collections</h2>
        <div className="cat-grid" style={{ marginTop: "1.4rem" }}>
          {CATS.map((c) => (
            <Link key={c.name} to={c.slug ? `/shop?category=${c.slug}` : "/shop?isNew=true"} className="cat-card">
              <img src={c.img} alt={c.name} loading="lazy" />
              <div><strong>{c.name}</strong><br /><small>Découvrir →</small></div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
          <div><p className="eyebrow">Fraîchement arrivés</p><h2>Nouveautés</h2></div>
          <Link to="/shop?isNew=true">Tout voir →</Link>
        </div>
        <div className="grid-products" style={{ marginTop: "1.2rem" }}>
          {fresh.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      <section className="section" style={{ textAlign: "center", background: "#fff", border: "1px solid var(--line)", borderRadius: 24, padding: "3rem 1.5rem", marginTop: "3rem" }}>
        <p className="eyebrow">Instagram</p>
        <h2>Suivez @c_k.collection__ ♥</h2>
        <p style={{ color: "var(--muted)" }}>Looks, nouveautés & coulisses — rejoignez la communauté.</p>
        <a className="btn btn-rose" href={import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/c_k.collection__/"} target="_blank" rel="noreferrer">Suivre sur Instagram</a>
      </section>
    </div>
  );
}
