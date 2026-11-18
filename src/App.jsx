import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoomsPage from './pages/RoomsPage';
import AuthPage from './pages/AuthPage';
import BookingsPage from './pages/BookingsPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">OceanBreeze</Link>
      <div className="nav-links">
        <Link to="/">Villas & Rooms</Link>
        {user && user.role?.toLowerCase() === 'guest' && <Link to="/bookings">My Bookings</Link>}
        {user && user.role?.toLowerCase() === 'admin' && <Link to="/admin">Admin Dashboard</Link>}  
        {user ? (
          <>
            <span className="user-pill">{user.name} ({user.role})</span>
            <button onClick={logout} className="btn-secondary-sm">Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn-primary-sm">Login / Register</Link>
        )}
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role?.toLowerCase() !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<RoomsPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}