import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import type { Role } from "../../context/AuthProvider";
import type { JSX } from "react/jsx-dev-runtime";

export default function RoleRoute({ allow, children }:{ allow: Role[]; children: JSX.Element }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allow.includes(user.role)) return <Navigate to={user.role === "DRIVER" ? "/scan" : "/"} replace />;
  return children;
}
