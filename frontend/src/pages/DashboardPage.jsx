import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

export default function DashboardPage() {
  const [groups, setGroups] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      //preia grupurile unui utilizator autentificat
      const data = await api("/api/event-groups");
      setGroups(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  //incarca grupurile la prima accesare a paginii
  useEffect(() => { load(); }, []);

  async function createGroup(e) {
    e.preventDefault();
    setErr("");
    try {
      //creeaza grup nou
      await api("/api/event-groups", { method: "POST", body: { name, description } });
      //reseteaza formularul
      setName(""); setDescription("");
      await load();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>Grupurile mele</h2>
        {err && <p style={{color:"crimson"}}>{err}</p>}
        {groups.length === 0 ? (
          <p style={{opacity:.7}}>Nu ai grupuri inca.</p>
        ) : (
          <ul>
            {groups.map((g) => (
              <li key={g.id}>
                <Link to={`/groups/${g.id}`}>{g.name}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>Adauga grup</h2>
        <form onSubmit={createGroup}>
          <label className="label">Nume grup</label>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} />

          <div style={{height:10}} />

          <label className="label">Descriere (optional)</label>
          <input className="input" value={description} onChange={(e)=>setDescription(e.target.value)} />

          <div style={{height:12}} />
          <button className="btn">Creeaza</button>
        </form>
      </div>
    </div>
  );
}
