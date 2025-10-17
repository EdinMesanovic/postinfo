// src/components/Layout/Layout.tsx
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";
import "./Layout.css";

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      {/* ⬇⬇⬇ dodaj no-print */}
      <header className="topbar no-print">
        <div className="brand">PostInfo</div>
        <nav className="nav">
          {user?.role === "ADMIN" && (
            <>
              <NavLink to="/" end>Dashboard</NavLink>
              <NavLink to="/new-shipment">Nova pošiljka</NavLink>
              <NavLink to="/shipments">Pošiljke</NavLink>
            </>
          )}
          <NavLink to="/scan">Scan</NavLink>
        </nav>
        <div style={{marginLeft:"auto", display:"flex", gap:12, alignItems:"center"}}>
          <span>{user?.username} · {user?.role}</span>
          <button className="btn" onClick={logout}>Odjava</button>
        </div>
      </header>

      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
