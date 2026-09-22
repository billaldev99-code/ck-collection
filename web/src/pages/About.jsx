export default function About() {
  return (
    <div className="container section">
      <p className="eyebrow">Notre histoire</p>
      <h1>C-K-Collection, l'élégance au quotidien</h1>
      <p style={{ maxWidth: 640, color: "#5b4d49" }}>Née d'une passion pour la mode féminine, C-K-Collection habille les femmes modernes avec des pièces douces, raffinées et accessibles : pyjamas cocooning, ensembles, robes d'exception. Chaque collection est choisie avec soin pour sublimer votre style, du casual au chic.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginTop: "2rem" }}>
        {[["♥", "Pensé pour vous", "Coupes féminines, tailles variées."], ["✦", "Qualité premium", "Tissus doux sélectionnés."], ["➤", "Livraison 68 wilayas", "Paiement à la livraison."]].map(([i, t, d]) => (
          <div key={t} className="card" style={{ padding: "1.4rem" }}><div style={{ fontSize: "1.6rem" }}>{i}</div><h3>{t}</h3><p style={{ color: "var(--muted)" }}>{d}</p></div>
        ))}
      </div>
    </div>
  );
}
