import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "./context/AuthProvider";

export default function App() {
  const [open, setOpen] = useState(false);
  const year = useMemo(() => new Date().getFullYear(), []);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const nav = [
    { to: "/", label: "Dashboard", end: true },
    { to: "/shipments", label: "Pošiljke" },
    { to: "/new-shipment", label: "Nova pošiljka" },
    { to: "/scan", label: "Skeniraj" },
  ];

  const userLabel = (user as any)?.username || (user as any)?.email || "Korisnik";

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2">
            <span className="inline-block h-7 w-7 rounded-md bg-emerald-500" />
            <h1 className="text-lg font-semibold text-slate-800">Bingo Posta</h1>
          </NavLink>

          {/* Desktop navigacija */}
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-100 text-emerald-800 shadow" // SVJETLO ZELENA za aktivan link
                      : "text-slate-700 hover:bg-slate-100",
                  ].join(" ")
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Desno: user + logout (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-slate-600"><b className="text-slate-800">{userLabel}</b></span>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              Odjava
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* Mobile nav + user blok */}
        {open && (
          <nav className="md:hidden border-t bg-white">
            <ul className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1">
              {nav.map((n) => (
                <li key={n.to}>
                  <NavLink
                    to={n.to}
                    end={n.end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      [
                        "block rounded-lg px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-emerald-100 text-emerald-800 shadow" // SVJETLO ZELENA aktivno
                          : "text-slate-700 hover:bg-slate-100",
                      ].join(" ")
                    }
                  >
                    {n.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-2 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="text-sm text-slate-700"><b className="text-slate-900">{userLabel}</b></span>
                <button
                  onClick={() => { setOpen(false); handleLogout(); }}
                  className="rounded-md px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  Odjava
                </button>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* SADRŽAJ */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-white py-4 text-center text-xs text-slate-500">
        © {year} Bingo d.o.o. — Sva prava zadržana.
      </footer>
    </div>
  );
}
