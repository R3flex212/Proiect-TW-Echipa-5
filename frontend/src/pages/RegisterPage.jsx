import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setToken } from "../api.js";

export default function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      const data = await api("/api/auth/register", { method: "POST", body: { name, email, password }, auth: false });
      setToken(data.token);
      nav("/dashboard");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="card" style={{maxWidth:480}}>
      <h2>Register organizator</h2>
      <form onSubmit={onSubmit}>
        <label className="label">Nume</label>
        <input className="input" value={name} onChange={(e)=>setName(e.target.value)} />

        <div style={{height:10}} />

        <label className="label">Email</label>
        <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />

        <div style={{height:10}} />

        <label className="label">Parola</label>
        <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />

        <div style={{height:12}} />
        <button className="btn">Creeaza cont</button>

        {err && <p style={{color:"crimson"}}>{err}</p>}
      </form>

      <p style={{marginTop:12}}>
        Ai deja cont? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
