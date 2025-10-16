import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthProvider";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      const r = await api.post("/auth/login", { email, pin });
      setUser(r.data.user);
      const next = search.get("next") || "/";
      navigate(next, { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Neuspjela prijava");
    }
  };

  return (
    <div className="card" style={{maxWidth:420, margin:"40px auto"}}>
      <h2>Prijava</h2>
      <form onSubmit={onSubmit} className="col" style={{gap:12}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        <input value={pin} onChange={e=>setPin(e.target.value)} placeholder="PIN" type="password" />
        {err && <div className="error">{err}</div>}
        <button className="btn primary" type="submit">Prijavi se</button>
      </form>
    </div>
  );
}
