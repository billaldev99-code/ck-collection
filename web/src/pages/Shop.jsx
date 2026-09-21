import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0 });
  const [cats, setCats] = useState([]);
  const q = sp.get("q") || "", category = sp.get("category") || "", sort = sp.get("sort") || "new";

  useEffect(() => { api.categories().then((d) => setCats(d.items)).catch(() => {}); }, []);
  useEffect(() => {
    const qs = new URLSearchParams({ limit: "24", sort, ...(q ? { q } : {}), ...(category ? { category } : {}), ...(sp.get("isNew") ? { isNew: "true" } : {}) }).toString();
    api.products(`?${qs}`).then(setData).catch(() => {});
  }, [q, category, sort, sp]);

  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };

  return (
    <div className="container section">
      <p className="eyebrow">Boutique</p>
      <h1>Collections</h1>
      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap", margin: "1.2rem 0" }}>
        <input className="input" placeholder="Rechercher une robe, ensemble..." value={q} onChange={(e) => set("q", e.target.value)} style={{ maxWidth: 280 }} />
        <select className="input" value={category} onChange={(e) => set("category", e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">Toutes catégories</option>
          {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select className="input" value={sort} onChange={(e) => set("sort", e.target.value)} style={{ maxWidth: 200 }}>
          <option value="new">Nouveautés</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="name">Nom A-Z</option>
        </select>
      </div>
      <p style={{ color: "var(--muted)" }}>{data.total} article(s)</p>
      <div className="grid-products">{data.items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
    </div>
  );
}
