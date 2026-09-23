import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { count } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  return (
    <>
      <header className="header">
        <div className="container nav">
          <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Menu" style={{ display: "grid" }}>☰</button>
          <Link to="/" className="logo">C-K-<span>Collection</span></Link>
          <nav className="links">
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/shop">Collections</NavLink>
            <NavLink to="/shop?isNew=true">Nouveautés</NavLink>
            <NavLink to="/about">À propos</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          </nav>
          <div className="icons">
            <button className="icon-btn" onClick={() => nav("/shop")} aria-label="Recherche">⌕</button>
            {user ? (
              <button className="icon-btn" onClick={() => { logout(); nav("/"); }} aria-label="Déconnexion" title="Déconnexion">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            ) : (
              <button className="icon-btn" onClick={() => nav("/login")} aria-label="Compte" title="Se connecter">👤</button>
            )}
            <button className="icon-btn" onClick={() => nav("/cart")} aria-label="Panier">🛒{count > 0 && <span className="cart-count">{count}</span>}</button>
          </div>
        </div>
      </header>
      <div className={`mobile-menu ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <div className="mobile-panel" onClick={(e) => e.stopPropagation()}>
          <h3>C-K-Collection</h3>
          <div style={{ display: "grid", gap: ".9rem", marginTop: "1.2rem" }}>
            {[["/", "Accueil"], ["/shop", "Collections"], ["/shop?isNew=true", "Nouveautés"], ["/about", "À propos"], ["/contact", "Contact"], ["/cart", "Panier"]].map(([to, l]) => (
              <Link key={to + l} to={to} onClick={() => setOpen(false)}>{l}</Link>
            ))}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
            {user ? <button className="btn btn-ghost" onClick={() => { logout(); setOpen(false); nav("/"); }}>Déconnexion</button>
              : <Link className="btn btn-dark" to="/login" onClick={() => setOpen(false)}>Se connecter</Link>}
          </div>
        </div>
      </div>
    </>
  );
}
