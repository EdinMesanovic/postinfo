import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

export type Role = "ADMIN" | "DRIVER";
export type Me = { _id: string; username: string; role: Role };

// ✅ login sada očekuje username/password
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

// Držimo tokene u memoriji procesa (ne u storageu)
let accessTokenMem: string | null = null;
let refreshTokenMem: string | null = null;

// Helper da postavimo/počistimo Authorization header na axios instanci
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

  const refresh = async () => {
    try {
      setLoading(true);
      const r = await api.get<{ ok: true; user: Me }>("/auth/me");
      setUser(r.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Napomena: pošto ne perzistiramo tokene, poslije reload-a nemamo Authorization header,
    // pa će /auth/me vratiti 401 i user ostaje null — što je OK (ponovna prijava).
    void refresh();
  }, []);

  const login = async ({ username, password }: LoginCreds): Promise<boolean> => {
    try {
      const r = await api.post("/auth/login", { username, password });
      // Backend vraća: { ok, accessToken, refreshToken, user }
      const { accessToken, refreshToken, user } = r.data as {
        accessToken: string;
        refreshToken: string;
        user: { id: string; username: string; role: Role };
      };

      // Zapamti tokene u memoriji i postavi Authorization header
      accessTokenMem = accessToken;
      refreshTokenMem = refreshToken;
      setAuthHeader(accessTokenMem);

      // Postavi user odmah (brži UX); alternativno: await refresh()
      setUser({ _id: user.id, username: user.username, role: user.role });
      return true;
    } catch {
      // neuspješan login — očisti sve za svaki slučaj
      accessTokenMem = null;
      refreshTokenMem = null;
      setAuthHeader(null);
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      accessTokenMem = null;
      refreshTokenMem = null;
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