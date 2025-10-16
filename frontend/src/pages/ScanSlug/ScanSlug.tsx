// src/pages/ScanSlug.tsx  (ruta: /scan/:slug)
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function ScanSlug() {
  const { slug } = useParams();
  const [msg, setMsg] = useState("Skeniram…");
  const navigate = useNavigate();

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        await api.post("/shipments/scan/pickup", { qrSlug: slug });
        setMsg("✅ Pošiljka označena kao preuzeta");
      } catch (e: any) {
        if (e?.response?.status === 401) {
          navigate(`/login?next=${encodeURIComponent(`/scan/${slug}`)}`);
          return;
        }
        setMsg("❌ Greška prilikom preuzimanja");
      }
    })();
  }, [slug]);

  return <div className="card" style={{maxWidth:520, margin:"40px auto"}}><h2>{msg}</h2></div>;
}
