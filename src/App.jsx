import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Background from './components/Background';

import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Forgate   from './pages/Forgate';
import Dashboard from './pages/Dashboard';
import User      from './pages/User';
import Carate    from './pages/Carate';

// ── Auth Guard ─────────────────────────────────────────────────────
// Token hai toh protected page dikha, warna Login pe bhej do
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" replace />;
};

// ── Public Guard ───────────────────────────────────────────────────
// Already logged in hai toh Dashboard pe bhej do
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/dashboard" replace /> : children;
};

// ── App ────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden relative">
      <Background />
      <BrowserRouter>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<Home />} />

          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />

          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          <Route path="/forgot-password" element={
            <PublicRoute><Forgate /></PublicRoute>
          } />

          {/* Protected Pages */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />

          <Route path="/user" element={
            <PrivateRoute><User /></PrivateRoute>
          } />

          <Route path="/create-key" element={
            <PrivateRoute><Carate /></PrivateRoute>
          } />

          {/* 404 → Home */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}
