import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Shipment, ShipmentStatus } from '../../lib/types';
import { Link } from 'react-router-dom';
import Badge from '../../components/Badge';

export default function Shipments() {
  const [list, setList] = useState<Shipment[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<ShipmentStatus | ''>('');

  const load = async () => {
    const r = await api.get<Shipment[]>('/shipments', { params: { q, status }});
    setList(r.data);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="stack">
      <h1>Pošiljke</h1>

      <div className="row card">
        <input placeholder="Pretraga (PJ / QR)" value={q} onChange={e=>setQ(e.target.value)} />
        <select value={status} onChange={e=>setStatus(e.target.value as any)}>
          <option value="">Svi statusi</option>
          <option value="CREATED_IN_POST">U pošti</option>
          <option value="AT_LDC">U LDC</option>
          <option value="PICKED_BY_DRIVER">Preuzeo vozač</option>
          <option value="DELIVERED">Isporučeno</option>
        </select>
        <button className="btn" onClick={load}>Primijeni</button>
      </div>

      <div className="table card">
        <div className="thead"><div>PJ</div><div>Status</div><div>Kreirano</div><div>Akcije</div></div>
        <div className="tbody">
          {list.map(s => (
            <div className="tr" key={s._id}>
              <div>{s.pjCode} — {s.pjName}</div>
              <div><Badge status={s.status} /></div>
              <div>{new Date(s.createdAt).toLocaleString()}</div>
              <div className="row">
                <Link className="btn" to={`/print/${s._id}`} target="_blank">Print</Link>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="tr">Nema rezultata.</div>}
        </div>
      </div>
    </div>
  );
}
