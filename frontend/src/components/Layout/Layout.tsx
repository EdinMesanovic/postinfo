import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <header className="topbar">
        <div className="brand">PostInfo</div>
        <nav className="nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/new-shipment">Nova pošiljka</NavLink>
          <NavLink to="/shipments">Pošiljke</NavLink>
          <NavLink to="/scan">Scan</NavLink>
        </nav>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
