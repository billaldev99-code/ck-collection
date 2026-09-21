import { Link } from "react-router-dom";
export default function Footer() {
  const insta = import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com";
  return (
    <footer className="footer">
      <div className="container" style={{ display: "grid", gap: "2rem", padding: "3rem 0", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <div>
          <h3 style={{ color: "#fff" }}>C-K-Collection</h3>
          <p style={{ opacity: .75 }}>Découvrez votre style — mode féminine, élégante & moderne.</p>
          <a href={insta} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ color: "#fff", borderColor: "#ffffff33" }}>Instagram ♥</a>
        </div>
        <div><h4>Boutique</h4><div style={{ display: "grid", gap: ".5rem" }}><Link to="/shop">Collections</Link><Link to="/shop?isNew=true">Nouveautés</Link><Link to="/cart">Panier</Link></div></div>
        <div><h4>Maison</h4><div style={{ display: "grid", gap: ".5rem" }}><Link to="/about">À propos</Link><Link to="/contact">Contact</Link><Link to="/login">Compte</Link></div></div>
        <div><h4>Infos</h4><p style={{ opacity: .7, fontSize: ".9rem" }}>Paiement à la livraison<br />Livraison 58 wilayas<br />© 2026 C-K-Collection</p></div>
      </div>
    </footer>
  );
}
