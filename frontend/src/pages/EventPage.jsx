import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, getToken } from "../api.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

//download cu autentificare
async function downloadWithAuth(path, filename) {
  const token = getToken();
  const resp = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(txt || "Descarcare esuata");
  }

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

export default function EventPage() {

  const { id } = useParams();
  const eventId = Number(id);

  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [qr, setQr] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      //detalii even
      const ev = await api(`/api/events/${eventId}`);
      //qr
      const q = await api(`/api/events/${eventId}/qr`);
      //lista prezente
      const att = await api(`/api/events/${eventId}/attendance`);
      setEvent(ev);
      setQr(q);
      setAttendance(att);
    } catch (e) {
      setErr(e.message);
    }
  }

  //reincarcare date cand se schimba eventId
  useEffect(() => { load(); }, [eventId]);

  async function setStatus(status) {
    setErr("");
    try {
    //setare FORCE OPEN/CLOSED
      await api(`/api/events/${eventId}/status`, { method: "PATCH", body: { status, manual: true } });
      await load();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  async function setAuto() {
    setErr("");
    try {
      //modul auto din backend
      await api(`/api/events/${eventId}/status`, { method: "PATCH", body: { status: event.status, manual: false } });
      await load();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  if (!event) return <div className="card">Se incarca...</div>;

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 520px"}}>
        <h2>{event.title}</h2>
        {event.description && <p style={{opacity:.75}}>{event.description}</p>}
        <p>
          <span className="badge">Status: {event.status}{event.statusManual ? " (manual)" : ""}</span>
        </p>

        <p style={{opacity:.75}}>
          {new Date(event.startTime).toLocaleString()} – {new Date(event.endTime).toLocaleString()}
        </p>

        {err && <p style={{color:"crimson"}}>{err}</p>}

        <div className="row">
          <button className="btn" onClick={() => setStatus("OPEN")}>Force OPEN</button>
          <button className="btn secondary" onClick={() => setStatus("CLOSED")}>Force CLOSED</button>
          <button className="btn secondary" onClick={setAuto}>Revenire la AUTO</button>
        </div>

        <hr />

        <h3>Cod acces</h3>
        {qr && (
          <>
            <p><b>{qr.accessCode}</b></p>
            {qr.qrDataUrl && <img src={qr.qrDataUrl} alt="QR" style={{width:180}} />}
          </>
        )}

        <hr />

        <h3>Export</h3>
        <div className="row">
          <button
            className="btn secondary"
            onClick={() => downloadWithAuth(`/api/events/${eventId}/export?format=csv`, `event-${eventId}-prezenta.csv`)}
          >
            Export CSV
          </button>
          <button
            className="btn secondary"
            onClick={() => downloadWithAuth(`/api/events/${eventId}/export?format=xlsx`, `event-${eventId}-prezenta.xlsx`)}
          >
            Export XLSX
          </button>
        </div>
      </div>

      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>Prezenti ({attendance.length})</h2>
        {attendance.length === 0 ? (
          <p style={{opacity:.7}}>Inca nu s-a facut check-in.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nume</th>
                <th>Email</th>
                <th>Ora</th>
                <th>Metoa</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.id}>
                  <td>{a.participant?.name}</td>
                  <td>{a.participant?.email || "-"}</td>
                  <td>{new Date(a.joinedAt).toLocaleString()}</td>
                  <td>{a.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{marginTop:12}}>
          <button className="btn secondary" onClick={load}>Refresh</button>
        </div>
      </div>
    </div>
  );
}
