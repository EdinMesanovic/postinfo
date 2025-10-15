import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Shipment } from '../../lib/types';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge';

export default function Dashboard() {
  const [recent, setRecent] = useState<Shipment[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<Shipment[]>('/shipments', { params: { limit: 10 } })
      .then(r => setRecent(r.data))
      .catch(() => setRecent([]));
  }, []);

  return (
    <div className="stack">
      <div className="row" style={{justifyContent:'space-between'}}>
        <h1>Dashboard</h1>
        <div className="row">
          <Link className="btn primary" to="/new-shipment">+ Nova pošiljka</Link>
          <Link className="btn" to="/shipments">Sve pošiljke</Link>
        </div>
      </div>

      <section className="card">
        <div className="row" style={{justifyContent:'space-between'}}>
          <h2>Zadnjih 10 pošiljki</h2>
          <button className="btn" onClick={() => navigate('/shipments')}>Prikaži sve</button>
        </div>
        <div className="table">
          <div className="thead"><div>PJ</div><div>Status</div><div>Kreirano</div><div>Akcije</div></div>
          <div className="tbody">
            {recent.map(s => (
              <div className="tr" key={s._id}>
                <div>{s.pjCode} — {s.pjName}</div>
                <div><Badge status={s.status} /></div>
                <div>{new Date(s.createdAt).toLocaleString()}</div>
                <div className="row">
                  <Link className="btn" to={`/print/${s._id}`} target="_blank">Print</Link>
                </div>
              </div>
            ))}
            {recent.length === 0 && <div className="tr">Nema pošiljki.</div>}
          </div>
        </div>
      </section>
    </div>
  );
}
