import { useState } from "react";
import { api } from "../services/api";
export default function Contact() {
  const [f, setF] = useState({ name: "", phone: "", message: "" });
  const [ok, setOk] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="container section" style={{ display: "grid", gap: "2rem", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))" }}>
      <div>
        <p className="eyebrow">Contact</p>
        <h1>Parlons-nous ♥</h1>
        <p>Instagram : <a href={import.meta.env.VITE_INSTAGRAM_URL || "https://www.instagram.com/c_k.collection__/"} target="_blank" rel="noreferrer" style={{ color: "var(--rose-deep)" }}>@c_k.collection__</a></p>
        <p>Téléphone / WhatsApp : <a href="tel:0791592880" style={{ color: "var(--rose-deep)", fontWeight: 600 }}>0791 59 28 80</a>{" "}(<a href="https://wa.me/213791592880" target="_blank" rel="noreferrer" style={{ color: "var(--rose-deep)" }}>WhatsApp direct</a>)</p>
        <p style={{ color: "var(--muted)" }}>Réponse rapide 7j/7 — n'hésitez pas pour une taille, un stock ou une commande.</p>
      </div>
      <form className="card" style={{ padding: "1.5rem", display: "grid", gap: ".7rem" }} onSubmit={async (e) => { e.preventDefault(); try { await api.contact(f); setOk("Message envoyé, merci !"); setF({ name: "", phone: "", message: "" }); } catch (ex) { setOk(ex.message); } }}>
        <input className="input" placeholder="Votre nom" value={f.name} onChange={set("name")} required />
        <input className="input" placeholder="Téléphone" value={f.phone} onChange={set("phone")} />
        <textarea className="input" placeholder="Votre message..." rows="5" value={f.message} onChange={set("message")} required />
        <button className="btn btn-dark">Envoyer</button>
        {ok && <small>{ok}</small>}
      </form>
    </div>
  );
}
