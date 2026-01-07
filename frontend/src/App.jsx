import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
//acces doar pentru useri
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import GroupPage from "./pages/GroupPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import CheckInPage from "./pages/CheckInPage.jsx";

export default function App() {
  return (
    <>
      <NavBar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/checkin" replace />} />
          <Route path="/checkin" element={<CheckInPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events/:id"
            element={
              <ProtectedRoute>
                <EventPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div className="card">Pagina nu exista.</div>} />
        </Routes>
      </div>
    </>
  );
}
