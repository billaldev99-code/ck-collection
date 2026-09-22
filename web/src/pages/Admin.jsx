import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, fmtDA } from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", oldPrice: "", stock: 0, categoryId: "", description: "", image: "", isNew: true, isActive: true });

  useEffect(() => { if (!loading && !isAdmin) nav("/login"); }, [loading, isAdmin, nav]);
  useEffect(() => {
    if (!isAdmin) return;
    api.admin.stats().then(setStats).catch(() => {});
    api.admin.orders("?limit=50").then((d) => setOrders(d.items)).catch(() => {});
    api.products("?limit=50&active=").then((d) => setProducts(d.items)).catch(() => {});
    api.categories().then((d) => setCats(d.items)).catch(() => {});
    api.admin.contacts().then((d) => setContacts(d.items || [])).catch(() => {});
  }, [isAdmin]);

  const loadContacts = () => api.admin.contacts().then((d) => setContacts(d.items || [])).catch(() => {});

  if (loading) return <div className="container section">Chargement...</div>;
  if (!isAdmin) return null;

  async function saveProduct(e) {
    e.preventDefault();
    const body = {
      name: form.name, description: form.description,
      price: Math.round(Number(form.price) * 100), oldPrice: form.oldPrice ? Math.round(Number(form.oldPrice) * 100) : null,
      stock: Number(form.stock), categoryId: form.categoryId || null,
      isNew: !!form.isNew, isActive: !!form.isActive, isPromo: !!form.oldPrice,
      images: form.image ? [{ url: form.image }] : [], variants: ["XS", "S", "M", "L", "XL", "XXL"].map((size) => ({ size, stock: Number(form.stock) })),
    };
    await api.admin.createProduct(body);
    const d = await api.products("?limit=50&active=");
    setProducts(d.items);
    setForm({ name: "", price: "", oldPrice: "", stock: 0, categoryId: "", description: "", image: "", isNew: true, isActive: true });
  }

  return (
    <div className="container section">
      <h1>Admin ♥</h1>
      <div className="admin-layout" style={{ marginTop: "1rem" }}>
        <aside className="admin-side" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
          {[["stats", "Stats"], ["orders", "Commandes"], ["products", "Produits"], ["contacts", `Messages (${contacts.length})`]].map(([k, l]) => (
            <button key={k} className={`btn ${tab === k ? "btn-dark" : "btn-ghost"}`} onClick={() => setTab(k)}>{l}</button>
          ))}
          <Link to="/" className="btn btn-ghost">Voir le site</Link>
        </aside>
        <div>
          {tab === "stats" && stats && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "1rem" }}>
              {[["Commandes", stats.orders], ["Produits", stats.products], ["Clientes", stats.customers], ["CA", fmtDA(stats.revenue)]].map(([l, v]) => (
                <div key={l} className="card" style={{ padding: "1.2rem" }}><small style={{ color: "var(--muted)" }}>{l}</small><h2>{v}</h2></div>
              ))}
              <div className="card" style={{ padding: "1.2rem", gridColumn: "1/-1" }}>
                <h3>Par statut</h3>
                {stats.byStatus?.map((s) => <div key={s.status} style={{ display: "flex", justifyContent: "space-between" }}><span>{s.status}</span><strong>{s._count}</strong></div>)}
              </div>
            </div>
          )}
          {tab === "orders" && (
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead><tr><th>N°</th><th>Cliente</th><th>Tél</th><th>Total</th><th>Statut</th><th></th></tr></thead>
                <tbody>{orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td><td>{o.firstName} {o.lastName}<br /><small>{o.wilaya}</small></td>
                    <td>{o.phone}</td><td>{fmtDA(o.total)}</td>
                    <td><select value={o.status} onChange={async (e) => { await api.admin.setStatus(o.id, e.target.value); setOrders((p) => p.map((x) => (x.id === o.id ? { ...x, status: e.target.value } : x))); }}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select></td>
                    <td><small>{o.items.length} art.</small></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          {tab === "products" && (
            <>
              <form className="card" onSubmit={saveProduct} style={{ padding: "1.2rem", display: "grid", gap: ".6rem", marginBottom: "1rem" }}>
                <h3>Ajouter un produit</h3>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                  <input className="input" placeholder="Nom *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ flex: 1 }} />
                  <input className="input" placeholder="Prix DA *" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required style={{ maxWidth: 140 }} />
                  <input className="input" placeholder="Ancien prix" type="number" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} style={{ maxWidth: 140 }} />
                  <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ maxWidth: 100 }} />
                </div>
                <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                  <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} style={{ flex: 1 }}>
                    <option value="">Sans catégorie</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input className="input" placeholder="URL image https://..." value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} style={{ flex: 2 }} />
                </div>
                <input className="input" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <button className="btn btn-dark">Ajouter</button>
              </form>
              <div style={{ overflowX: "auto" }}>
                <table className="table">
                  <thead><tr><th>Produit</th><th>Prix</th><th>Stock</th><th></th></tr></thead>
                  <tbody>{products.map((p) => (
                    <tr key={p.id}><td>{p.name}<br /><small>{p.slug}</small></td><td>{fmtDA(p.price)}</td><td>{p.stock}</td>
                      <td><button onClick={async () => { if (confirm("Supprimer ?")) { await api.admin.deleteProduct(p.id); setProducts((x) => x.filter((y) => y.id !== p.id)); } }} style={{ color: "crimson", background: "none", border: 0, cursor: "pointer" }}>Supprimer</button></td></tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          )}
          {tab === "contacts" && (
            <div style={{ display: "grid", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Messages reçus ({contacts.length})</h2>
                <button className="btn btn-ghost" onClick={loadContacts}>Actualiser 🔄</button>
              </div>
              {contacts.length === 0 ? (
                <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                  Aucun message reçu pour le moment.
                </div>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="card" style={{ padding: "1.2rem", display: "grid", gap: ".6rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
                      <div>
                        <strong style={{ fontSize: "1.05rem" }}>{c.name}</strong>
                        {c.phone && (
                          <div style={{ marginTop: ".3rem" }}>
                            📞 <a href={`tel:${c.phone}`} style={{ color: "var(--rose-deep)", fontWeight: 600 }}>{c.phone}</a>
                            {" · "}
                            <a href={`https://wa.me/${c.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" style={{ color: "var(--rose-deep)", fontSize: ".85rem" }}>Ouvrir WhatsApp</a>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <small style={{ color: "var(--muted)" }}>{new Date(c.createdAt).toLocaleString("fr-FR")}</small>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: ".3rem .7rem", fontSize: ".8rem", color: "crimson", borderColor: "#fdd" }}
                          onClick={async () => {
                            if (!window.confirm("Supprimer ce message ?")) return;
                            await api.admin.deleteContact(c.id);
                            setContacts((prev) => prev.filter((x) => x.id !== c.id));
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <div style={{ background: "var(--cream)", padding: "1rem", borderRadius: "10px", whiteSpace: "pre-wrap", color: "var(--ink)", border: "1px solid var(--line)" }}>
                      {c.message}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
