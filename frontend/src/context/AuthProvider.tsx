import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

export type Role = "ADMIN" | "DRIVER";
export type Me = { _id: string; name: string; role: Role };

type AuthCtx = {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: Me | null) => void;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, loading: true, refresh: async () => {}, setUser: () => {}, logout: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const r = await api.get<{ ok: true; user: Me }>("/auth/me");
      setUser(r.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, refresh, setUser, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() { return useContext(Ctx); }
