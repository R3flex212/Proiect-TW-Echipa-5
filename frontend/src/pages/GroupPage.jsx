import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, getToken } from "../api.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

//download cu autentificare
async function downloadWithAuth(path, filename) {
  const token = getToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) throw new Error("Download failed");

    //Transforma rsp in fisier
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

//converteste Data in ISO String ca sa fie citita de backend
function toISOFromLocal(dtLocal) {
  return new Date(dtLocal).toISOString();
}

export default function GroupPage() {
  const { id } = useParams();
  const groupId = Number(id);

  const [group, setGroup] = useState(null);
  const [err, setErr] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  async function load() {
    setErr("");
    try {
      //incarca detaliile grupului cu evenimente
      const data = await api(`/api/event-groups/${groupId}`);
      setGroup(data);
    } catch (e) {
      setErr(e.message);
    }
  }

  //reload cand se schimba groupId
  useEffect(() => { load(); }, [groupId]);

  async function createEvent(e) {
    e.preventDefault();
    setErr("");
    try {
      //creeaza un eveniment nou in grup
      await api(`/api/event-groups/${groupId}/events`, {
        method: "POST",
        body: {
          title,
          description,
          startTime: toISOFromLocal(startTime),
          endTime: toISOFromLocal(endTime),
        },
      });
      setTitle(""); setDescription(""); setStartTime(""); setEndTime("");
      await load();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  if (!group) return <div className="card">Se încarca...</div>;

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 520px"}}>
        <h2>{group.name}</h2>
        {group.description && <p style={{opacity:.75}}>{group.description}</p>}
        {err && <p style={{color:"crimson"}}>{err}</p>}

        <h3>Evenimente</h3>
        {group.events.length === 0 ? (
          <p style={{opacity:.7}}>Nu exista evenimente</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Titlu</th>
                <th>Interval</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {group.events.map((ev) => (
                <tr key={ev.id}>
                  <td><Link to={`/events/${ev.id}`}>{ev.title}</Link></td>
                  <td>
                    {new Date(ev.startTime).toLocaleString()} – {new Date(ev.endTime).toLocaleString()}
                  </td>
                  <td>{ev.status}{ev.statusManual ? " (manual)" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{marginTop:12}}>
          <h4>Export grup</h4>
          <div className="row">
            <button
              className="btn secondary"
              onClick={() => downloadWithAuth(`/api/event-groups/${groupId}/export?format=csv`, `group-${groupId}-prezenta.csv`)}
            >
              Export CSV
            </button>
            <button
              className="btn secondary"
              onClick={() => downloadWithAuth(`/api/event-groups/${groupId}/export?format=xlsx`, `group-${groupId}-prezenta.xlsx`)}
            >
              Export XLSX
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>Adauga eveniment</h2>
        <form onSubmit={createEvent}>
          <label className="label">Titlu</label>
          <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />

          <div style={{height:10}} />

          <label className="label">Descriere (optional)</label>
          <input className="input" value={description} onChange={(e)=>setDescription(e.target.value)} />

          <div style={{height:10}} />

          <label className="label">Start</label>
          <input className="input" type="datetime-local" value={startTime} onChange={(e)=>setStartTime(e.target.value)} />

          <div style={{height:10}} />

          <label className="label">Final</label>
          <input className="input" type="datetime-local" value={endTime} onChange={(e)=>setEndTime(e.target.value)} />

          <div style={{height:12}} />
          <button className="btn">Creeaza eveniment</button>
        </form>
      </div>
    </div>
  );
}
