import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

export type Role = "ADMIN" | "DRIVER";
export type Me = { _id: string; username: string; role: Role };
type LoginCreds = { username: string; password: string };

type AuthCtx = {
  user: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setUser: (u: Me | null) => void;
  logout: () => Promise<void>;
  login: (creds: LoginCreds) => Promise<boolean>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  setUser: () => {},
  logout: async () => {},
  login: async () => false,
});

function setAuthHeader(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Funkcija za provjeru i postavljanje usera
  const refresh = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // nema tokena -> nema poziva /auth/me
      setAuthHeader(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setAuthHeader(token);
      const r = await api.get<{ ok: true; user: Me }>("/auth/me");
      setUser(r.data.user);
    } catch {
      localStorage.removeItem("accessToken");
      setAuthHeader(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🔹 Kad se app pokrene, pokušaj učitati usera ako postoji token
    void refresh();

    // 🔹 Sinhronizacija login/logout-a između tabova
    const handler = (e: StorageEvent) => {
      if (e.key === "accessToken") {
        void refresh();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const login = async ({ username, password }: LoginCreds): Promise<boolean> => {
    try {
      const r = await api.post("/auth/login", { username, password });
      const { accessToken, user } = r.data as {
        accessToken: string;
        refreshToken?: string;
        user: { id: string; username: string; role: Role };
      };

      localStorage.setItem("accessToken", accessToken);
      setAuthHeader(accessToken);
      setUser({ _id: user.id, username: user.username, role: user.role });
      return true;
    } catch {
      localStorage.removeItem("accessToken");
      setAuthHeader(null);
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      setAuthHeader(null);
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
