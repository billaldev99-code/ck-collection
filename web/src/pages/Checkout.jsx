import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api, fmtDA } from "../services/api";

const WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida", "Sétif", "Tlemcen", "Béjaïa", "Autre"];

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", wilaya: "Alger", commune: "", address: "", notes: "" });
  const [done, setDone] = useState(null);
  const [err, setErr] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr("");
    try {
      const order = await api.createOrder({ ...form, items: items.map((i) => ({ productId: i.productId, size: i.size, color: i.color, quantity: i.quantity })) });
      setDone(order.order);
      clear();
    } catch (ex) { setErr(ex.message); }
  }

  if (done) return <div className="container section" style={{ textAlign: "center" }}><h1>Merci {done.firstName} ♥</h1><p>Commande <strong>{done.orderNumber}</strong> enregistrée — total <strong>{fmtDA(done.total)}</strong>.</p><p>Nous vous appellerons au {done.phone} pour confirmer.</p><button className="btn btn-dark" onClick={() => nav("/shop")}>Retour boutique</button></div>;
  if (!items.length && !done) return <div className="container section"><h1>Panier vide</h1></div>;

  return (
    <div className="container section">
      <h1>Commander</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", marginTop: "1rem" }}>
        <div style={{ display: "grid", gap: ".7rem" }}>
          <div style={{ display: "flex", gap: ".6rem" }}>
            <input className="input" placeholder="Nom" value={form.lastName} onChange={set("lastName")} required />
            <input className="input" placeholder="Prénom" value={form.firstName} onChange={set("firstName")} required />
          </div>
          <input className="input" placeholder="Téléphone (ex: 0550...)" value={form.phone} onChange={set("phone")} required />
          <div style={{ display: "flex", gap: ".6rem" }}>
            <select className="input" value={form.wilaya} onChange={set("wilaya")}>{WILAYAS.map((w) => <option key={w}>{w}</option>)}</select>
            <input className="input" placeholder="Commune" value={form.commune} onChange={set("commune")} required />
          </div>
          <input className="input" placeholder="Adresse complète" value={form.address} onChange={set("address")} required />
          <textarea className="input" placeholder="Infos complémentaires (optionnel)" value={form.notes} onChange={set("notes")} rows="3" />
          {err && <p style={{ color: "crimson" }}>{err}</p>}
          <button className="btn btn-rose" type="submit">Confirmer — paiement à la livraison</button>
        </div>
        <div className="card" style={{ padding: "1.4rem", alignSelf: "start" }}>
          <h3>Récapitulatif</h3>
          {items.map((i) => <div key={i.key} style={{ display: "flex", justifyContent: "space-between", fontSize: ".9rem", padding: ".3rem 0" }}><span>{i.name} × {i.quantity}</span><span>{fmtDA(i.price * i.quantity)}</span></div>)}
          <hr style={{ borderColor: "var(--line)" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sous-total</span><strong>{fmtDA(subtotal)}</strong></div>
          <small style={{ color: "var(--muted)" }}>+ frais de livraison selon wilaya</small>
        </div>
      </form>
    </div>
  );
}
