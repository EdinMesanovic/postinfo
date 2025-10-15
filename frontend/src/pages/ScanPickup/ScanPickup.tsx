import { useState } from 'react';
import { api } from '../../lib/api';

export default function ScanPickup() {
  const [qrSlug, setQrSlug] = useState('');
  const [resp, setResp] = useState<any>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = await api.post('/shipments/scan/pickup', { qrSlug });
    setResp(r.data);
  };

  return (
    <div className="card" style={{maxWidth:500}}>
      <h2>Označi preuzeto</h2>
      <form onSubmit={submit} className="row" style={{gap:12}}>
        <input placeholder="Unesi QR slug (npr. 10bddad8da24)" value={qrSlug} onChange={e=>setQrSlug(e.target.value)} />
        <button className="btn primary">Potvrdi</button>
      </form>
      {resp && <pre style={{marginTop:12}}>{JSON.stringify(resp, null, 2)}</pre>}
    </div>
  );
}
