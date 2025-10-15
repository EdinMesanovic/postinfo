import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
import type { Shipment } from '../../lib/types';
import { QRCodeCanvas } from 'qrcode.react';
import './print.css';

export default function PrintLabel() {
  const { id } = useParams();
  const [s, setS] = useState<Shipment | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<Shipment>(`/shipments/${id}`).then(r => setS(r.data));
  }, [id]);

  if (!s) return <div>Učitavam…</div>;

  return (
    <div className="sheet">
      <button className="no-print btn" onClick={() => window.print()}>Printaj</button>

      <div className="label">
        <div className="left">
          <QRCodeCanvas value={s.qrSlug} size={300} includeMargin />
        </div>
        <div className="right">
          <div><b>PJ:</b> {s.pjCode} — {s.pjName}</div>
          <div><b>Status:</b> {s.status}</div>
          {s.pieces ? <div><b>Komada:</b> {s.pieces}</div> : null}
          {s.notes ? <div><b>Napomena:</b> {s.notes}</div> : null}
        </div>
      </div>

      <div className="block">
        <div className="block-title">Dokumenti u pošiljci</div>
        <div className="lines">
          {Array.from({length: 12}).map((_,i) => <div key={i} className="line"/>)}
        </div>
      </div>
    </div>
  );
}
