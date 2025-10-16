import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

export type Role = "ADMIN" | "DRIVER";
export type Me = { _id: string; name: string; role: Role };

type LoginCreds = { email: string; pin: string };

type AuthCtx = {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: Me | null) => void;
  logout: () => Promise<void>;
  login: (creds: LoginCreds) => Promise<boolean>; // ⬅️ dodano
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
  logout: async () => {},
  login: async () => false, // ⬅️ dodano
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true); // ⬅️ da bude jasno da fetchamo stanje
      const r = await api.get<{ ok: true; user: Me }>("/auth/me");
      setUser(r.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // inicijalno povlačenje sesije
    void refresh();
  }, []);

  const login = async (creds: LoginCreds): Promise<boolean> => {
    try {
      // očekuje se da backend postavi cookie/token (Set-Cookie) ili sessiju
      const r = await api.post("/auth/login", creds);
      // Ako login prođe, povuci svježeg usera iz /auth/me (izbjegavaš duplu logiku parsiranja odgovora)
      await refresh();
      return r.status >= 200 && r.status < 300;
    } catch {
      // ne uspijeh logina
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      // čak i ako backend pukne, lokalno očisti state
      setUser(null);
    }
  };

  return (
    <Ctx.Provider value={{ user, loading, refresh, setUser, logout, login }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
