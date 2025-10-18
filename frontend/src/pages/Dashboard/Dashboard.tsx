import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { Shipment } from "../../lib/types";
import { Link, useNavigate } from "react-router-dom";
import Badge from "../../components/Badge";

function normalizeShipments(payload: unknown): Shipment[] {
  if (Array.isArray(payload)) return payload as Shipment[];
  if (payload && typeof payload === "object" && Array.isArray((payload as any).data)) {
    return (payload as any).data as Shipment[];
  }
  return [];
}

export default function Dashboard() {
  const [recent, setRecent] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await api.get("/shipments", { params: { limit: 10 } });
        const items = normalizeShipments(r.data);
        if (mounted) setRecent(items);
      } catch {
        if (mounted) setRecent([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const list = Array.isArray(recent) ? recent : [];

  return (
    <section className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/new-shipment"
            className="rounded-lg bg-slate-400 px-4 py-2 text-sm font-medium text-white"
          >
            + Nova pošiljka
          </Link>
          <Link
            to="/shipments"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sve pošiljke
          </Link>
        </div>
      </div>

      {/* Card with recent shipments */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Zadnjih 10 pošiljki</h2>
          <button
            onClick={() => navigate("/shipments")}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
          >
            Prikaži sve
          </button>
        </div>

        {/* Header */}
        <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-3 border-b border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">
          <div>PJ</div>
          <div>Status</div>
          <div>Kreirano</div>
          <div>Akcije</div>
        </div>

        {/* Body */}
        <div className="px-5 py-2">
          {loading && (
            <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-3 py-3 text-slate-500">
              Učitavanje…
            </div>
          )}

          {!loading && list.length === 0 && (
            <div className="grid grid-cols-[2fr_1fr_1.2fr_1fr] gap-3 py-3 text-slate-500">
              Nema pošiljki.
            </div>
          )}

          {!loading &&
            list.map((s) => (
              <div
                key={s._id}
                className="grid grid-cols-[2fr_1fr_1.2fr_1fr] items-center gap-3 border-b border-dashed border-slate-200 py-3 last:border-none"
              >
                <div className="text-slate-800">
                  {s.pjCode} - {s.pjName}
                </div>

                <div className="flex items-center gap-2">
                  {s.status === "PICKED_BY_DRIVER" && (s.pickedByName || s.pickedByUsername) ? (
                    <span className="text-sm text-slate-700">
                      vozač —{" "}
                      <span className="font-medium">
                        {s.pickedByName || s.pickedByUsername}
                      </span>
                    </span>
                  ) : (
                    <Badge status={s.status} />
                  )}
                </div>

                <div className="text-slate-600">
                  {s.createdAt
                    ? new Date(s.createdAt).toLocaleString("bs-BA", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—"}
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/print/${s._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Print
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </section>
    </section>
  );
}
