import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ identifier: "", password: "" });
  const [err, setErr] = useState("");
  return (
    <div className="container section" style={{ maxWidth: 440 }}>
      <h1>Connexion</h1>
      <form onSubmit={async (e) => { e.preventDefault(); try { await login(f.identifier, f.password); nav("/"); } catch (ex) { setErr(ex.message); } }} style={{ display: "grid", gap: ".7rem", marginTop: "1rem" }}>
        <input className="input" placeholder="Email ou téléphone" value={f.identifier} onChange={(e) => setF({ ...f, identifier: e.target.value })} required />
        <input className="input" type="password" placeholder="Mot de passe" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        {err && <p style={{ color: "crimson" }}>{err}</p>}
        <button className="btn btn-dark">Se connecter</button>
        <p>Pas de compte ? <Link to="/register" style={{ color: "var(--rose-deep)" }}>Créer un compte</Link></p>
      </form>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ firstName: "", lastName: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="container section" style={{ maxWidth: 440 }}>
      <h1>Créer un compte</h1>
      <form onSubmit={async (e) => { e.preventDefault(); try { await register(f); nav("/"); } catch (ex) { setErr(ex.message); } }} style={{ display: "grid", gap: ".7rem", marginTop: "1rem" }}>
        <div style={{ display: "flex", gap: ".6rem" }}>
          <input className="input" placeholder="Nom" value={f.lastName} onChange={set("lastName")} required />
          <input className="input" placeholder="Prénom" value={f.firstName} onChange={set("firstName")} required />
        </div>
        <input className="input" placeholder="Téléphone" value={f.phone} onChange={set("phone")} required />
        <input className="input" type="password" placeholder="Mot de passe (6+ caractères)" value={f.password} onChange={set("password")} required />
        {err && <p style={{ color: "crimson" }}>{err}</p>}
        <button className="btn btn-dark">S'inscrire</button>
      </form>
    </div>
  );
}
