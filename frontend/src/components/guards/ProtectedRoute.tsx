import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import type { JSX } from "react/jsx-dev-runtime";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  // console.log("[ProtectedRoute]", {
  //   pathname: loc.pathname,
  //   search: loc.search,
  //   user: !!user,
  //   loading,
  // });

  // Nikad ne redirectaj sa /login
  if (loc.pathname.startsWith("/login")) return children;

  if (loading) return <div style={{ padding: 24 }}>Učitavanje…</div>;

  if (!user) {
    // 🔑 više ne gradimo ?next=, nego koristimo state
    return (
      <Navigate
        to="/login"
        replace
        state={{ next: loc.pathname + loc.search }}
      />
    );
  }

  return children;
}
