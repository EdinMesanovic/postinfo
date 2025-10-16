import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import type { JSX } from "react/jsx-dev-runtime";

export default function RoleRoute({
  allow,
  children,
}: {
  allow: Array<"ADMIN" | "DRIVER">;
  children: JSX.Element;
}) {
  const { user } = useAuth();

  // Ovaj guard se prikazuje tek nakon ProtectedRoute-a,
  // zato ovdje NE radimo redirect na /login.
  if (!user) return null; // ili skeleton

  if (!allow.includes(user.role)) {
    // 403 UX – preusmjeri unutar app-a, ne na /login
    return user.role === "DRIVER" ? (
      <Navigate to="/scan" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  return children;
}
