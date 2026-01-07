import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { api } from "../api.js";

export default function CheckInPage() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState("TEXT");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [scanning, setScanning] = useState(false);

  //pastram instanta scannerului
  const qrRef = useRef(null);
  const qrBoxId = "qr-reader";

  useEffect(() => {
    return () => {
      // resetare scanner dupa refresh la pagina
      if (qrRef.current) {
        qrRef.current.stop().catch(() => {});
        qrRef.current.clear().catch(() => {});
      }
    };
  }, []);

  async function startScan() {
    setErr(""); setMsg("");
    setScanning(true);
    setMethod("QR");

    //initializare QR
    const qr = new Html5Qrcode(qrBoxId);
    qrRef.current = qr;

    try {
      //incearca initializarea camerei
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          //adauga codul in inputul din stanga
          setCode(decodedText.trim());
          setMsg("Cod citit din QR ✅");
          stopScan();
        }
      );
    } catch (e) {
      setErr("Nu se poate porni camera");
      setScanning(false);
    }
  }

  async function stopScan() {
    try {
      if (qrRef.current) {
        await qrRef.current.stop();
        await qrRef.current.clear();
      }
    } catch {}
    setScanning(false);
  }

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg("");

    try {
      const data = await api("/api/attendance/check-in", {
        method: "POST",
        auth: false,
        body: { code, name, email: email || undefined, method },
      });

      setMsg(data.message || "Prezenta inregistrata ✅");
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="row">
      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>Check-in</h2>

        <form onSubmit={submit}>
          <label className="label">Cod eveniment</label>
          <input className="input" value={code} onChange={(e)=>{setCode(e.target.value); setMethod("TEXT");}} placeholder="ex: ABCD-1234" />

          <div style={{height:10}} />

          <label className="label">Nume</label>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} />

          <div style={{height:10}} />

          <label className="label">Email (optional)</label>
          <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} />

          <div style={{height:12}} />
          <button className="btn">Confirma prezenta</button>
        </form>

        <div style={{height:12}} />
        <div className="row">
          {!scanning ? (
            <button className="btn secondary" onClick={startScan}>Scaneaza QR</button>
          ) : (
            <button className="btn danger" onClick={stopScan}>Opreste scanarea</button>
          )}
        </div>

        {msg && <p style={{color:"green"}}>{msg}</p>}
        {err && <p style={{color:"crimson"}}>{err}</p>}

        <p style={{opacity:.7, fontSize:13}}>
          Nota: evenimentul trebuie sa fie <b>OPEN</b> ca sa se accepte check-in.
        </p>
      </div>

      <div className="card" style={{flex:"1 1 420px"}}>
        <h2>Scanner QR</h2>
        <div id={qrBoxId} style={{width:"100%", minHeight:280, background:"#11182710", borderRadius:10}} />
      </div>
    </div>
  );
}
