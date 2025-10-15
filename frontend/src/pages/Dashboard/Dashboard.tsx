import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Shipment } from '../../lib/types';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge';

function normalizeShipments(payload: unknown): Shipment[] {
  // Podržava: [] ili { data: [] } ili bilo šta drugo -> []
  if (Array.isArray(payload)) return payload as Shipment[];
  if (payload && typeof payload === 'object' && Array.isArray((payload as any).data)) {
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
        const r = await api.get('/shipments', { params: { limit: 10 } });
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
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h1>Dashboard</h1>
        <div className="row">
          <Link className="btn primary" to="/new-shipment">+ Nova pošiljka</Link>
          <Link className="btn" to="/shipments">Sve pošiljke</Link>
        </div>
      </div>

      <section className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2>Zadnjih 10 pošiljki</h2>
          <button className="btn" onClick={() => navigate('/shipments')}>Prikaži sve</button>
        </div>

        <div className="table">
          <div className="thead">
            <div>PJ</div><div>Status</div><div>Kreirano</div><div>Akcije</div>
          </div>

          <div className="tbody">
            {loading && <div className="tr">Učitavanje…</div>}

            {!loading && list.length === 0 && (
              <div className="tr">Nema pošiljki.</div>
            )}

            {!loading && list.map((s) => (
              <div className="tr" key={s._id}>
                <div>{s.pjCode} — {s.pjName}</div>
                <div><Badge status={s.status} /></div>
                <div>
                  {s.createdAt
                    ? new Date(s.createdAt).toLocaleString('bs-BA', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </div>
                <div className="row">
                  <Link className="btn" to={`/print/${s._id}`} target="_blank" rel="noreferrer">Print</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
