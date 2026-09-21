import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("ck_token");
    if (!t) return setLoading(false);
    api.me().then((d) => setUser(d.user)).catch(() => localStorage.removeItem("ck_token")).finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => ({
    user, loading,
    isAdmin: user && ["ADMIN", "SUPER_ADMIN", "OPERATOR"].includes(user.role),
    async login(identifier, password) {
      const d = await api.login({ identifier, password });
      localStorage.setItem("ck_token", d.token);
      setUser(d.user);
    },
    async register(body) {
      const d = await api.register(body);
      localStorage.setItem("ck_token", d.token);
      setUser(d.user);
    },
    logout() { localStorage.removeItem("ck_token"); setUser(null); },
  }), [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
