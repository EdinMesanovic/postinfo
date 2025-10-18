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
      const ok = await login({ username, password });
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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-semibold text-slate-800">
          Prijava
        </h1>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
              Korisničko ime
            </label>
            <input
              id="username"
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Lozinka
            </label>
            <input
              id="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className={`w-full rounded-lg px-4 py-2 text-white transition ${
              submitting || loading
                ? "cursor-not-allowed bg-slate-400"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {submitting || loading ? "Prijavljivanje…" : "Prijavi se"}
          </button>
        </form>
      </div>
    </div>
  );
}
