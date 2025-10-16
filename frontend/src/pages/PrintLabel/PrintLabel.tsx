import { useEffect, useMemo, useState } from 'react';
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

  // Puni URL koji će iOS/Android kamera otvoriti direktno u browseru
  const qrUrl = useMemo(() => {
    if (!s) return '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/scan/${s.qrSlug}`;
  }, [s]);

  if (!s) return <div>Učitavam…</div>;

  return (
    <div className="sheet">
      <button className="no-print btn" onClick={() => window.print()}>Printaj</button>

      <div className="label">
        <div className="left">
          <QRCodeCanvas value={qrUrl} size={300} includeMargin />
          <div className="qr-caption">
            <div><b>QR:</b> {s.qrSlug}</div>
            <div style={{fontSize:12, color:'#555', wordBreak:'break-all'}}>{qrUrl}</div>
          </div>
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
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="line" />)}
        </div>
      </div>
    </div>
  );
}
