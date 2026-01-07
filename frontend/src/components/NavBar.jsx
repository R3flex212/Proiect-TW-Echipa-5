import { Link, useNavigate } from "react-router-dom";
import { clearToken, getToken } from "../api.js";

export default function NavBar() {
  const nav = useNavigate();
  const loggedIn = !!getToken();

  function logout() {
    clearToken();
    nav("/login");
  }

  return (
    <div className="nav">
      <div className="nav-inner">
        <div style={{display:"flex", gap:12, alignItems:"center"}}>
          <strong>Monitorizare Prezenta</strong>
        </div>

        <div style={{display:"flex", gap:10, alignItems:"center"}}>
          <Link to="/checkin">Check-in</Link>
          {loggedIn ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button className="btn secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
