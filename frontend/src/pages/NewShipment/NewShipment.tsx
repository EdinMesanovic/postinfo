import { useState } from 'react';
import { api } from '../../lib/api';
import type { Shipment } from '../../lib/types';
import { QRCodeCanvas } from 'qrcode.react';
import { Link } from 'react-router-dom';

export default function NewShipment() {
  const [form, setForm] = useState({ pjCode:'', pjName:'', pieces:'', notes:'' });
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await api.post<Shipment>('/shipments', {
        pjCode: form.pjCode.trim(),
        pjName: form.pjName.trim(),
        pieces: form.pieces ? Number(form.pieces) : undefined,
        notes: form.notes || undefined
      });
      setShipment(r.data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <h1>Nova pošiljka</h1>

      {!shipment && (
        <form className="card" onSubmit={submit}>
          <label><span>PJ kod</span>
            <input value={form.pjCode} onChange={e=>setForm(f=>({...f, pjCode:e.target.value}))} required />
          </label>
          <label><span>PJ naziv</span>
            <input value={form.pjName} onChange={e=>setForm(f=>({...f, pjName:e.target.value}))} required />
          </label>
          <label><span>Broj komada (opcionalno)</span>
            <input type="number" value={form.pieces} onChange={e=>setForm(f=>({...f, pieces:e.target.value}))} />
          </label>
          <label><span>Napomena (opcionalno)</span>
            <textarea rows={3} value={form.notes} onChange={e=>setForm(f=>({...f, notes:e.target.value}))} />
          </label>
          <button className="btn primary" disabled={!form.pjCode || !form.pjName || saving}>
            {saving ? 'Spremam…' : 'Generiši pošiljku + QR'}
          </button>
        </form>
      )}

      {shipment && (
        <div className="grid2">
          <div className="card">
            <div className="muted">PJ</div>
            <div className="title">{shipment.pjCode} — {shipment.pjName}</div>
            <div className="muted" style={{marginTop:10}}>QR payload</div>
            <code className="code">{shipment.qrSlug}</code>
            <div className="row" style={{marginTop:10}}>
              <Link className="btn" to={`/print/${shipment._id}`} target="_blank">A4 naljepnica (print)</Link>
              <Link className="btn" to="/new-shipment">+ Nova</Link>
            </div>
          </div>
          <div className="card" style={{display:'flex',justifyContent:'center',alignItems:'center'}}>
            <QRCodeCanvas value={shipment.qrSlug} size={256} includeMargin />
          </div>
        </div>
      )}
    </div>
  );
}
