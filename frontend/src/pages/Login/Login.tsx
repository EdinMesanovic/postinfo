import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

type LoginState = { next?: string } | null;

export default function Login() {
  const { user, login, loading } = useAuth();
  const loc = useLocation();
  const navigate = useNavigate();

  // `next` dolazi iz location.state (ako si koristio ProtectedRoute)
  const state = (loc.state as LoginState) ?? null;
  const rawNext = state?.next && !state.next.startsWith("/login") ? state.next : "/";
  const next = rawNext || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ako je već ulogovan, odmah ga preusmjeri
  if (!loading && user) {
    return <Navigate to={next} replace />;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const ok = await login({ username, password }); // ✅ koristi username + password
      if (ok) {
        sessionStorage.removeItem("nextPath");
        navigate(next, { replace: true, state: null });
      } else {
        setError("Neispravni podaci za prijavu.");
      }
    } catch {
      setError("Došlo je do greške prilikom prijave. Pokušaj ponovo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "48px auto",
        padding: 24,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <h1 style={{ marginBottom: 16 }}>Prijava</h1>

      {error && (
        <div
          style={{
            background: "#fee",
            border: "1px solid #f99",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Korisničko ime</span>
            <input
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Lozinka</span>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          </label>

          <button
            type="submit"
            disabled={submitting || loading}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #222",
              background: "#111",
              color: "#fff",
              cursor: submitting || loading ? "not-allowed" : "pointer",
            }}
          >
            {submitting || loading ? "Prijavljivanje…" : "Prijavi se"}
          </button>
        </div>
      </form>
    </div>
  );
}