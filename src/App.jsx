import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CharacterSelect from '../pages/CharacterSelect';
import BattlePage from '../pages/BattlePage';
import AdminDashboard from '../pages/AdminDashboard';
import { LogOut, Shield, Swords } from 'lucide-react';
import '../styles/main.css';
import '../styles/animations.css';

const Navigation = () => {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">
          <img src="/images/logo-game-fight.png" alt="Game Fight" className="nav-logo" />
          <span>Game Fight</span>
        </Link>
      </div>
      <div className="nav-links">
        <span className="nav-user">👤 {user.username}</span>
        {isAdmin() && (
          <Link to="/admin" className="nav-link">
            <Shield size={18} />
            Admin
          </Link>
        )}
        <Link to="/" className="nav-link">
          <Swords size={18} />
          Jouer
        </Link>
        <button onClick={logout} className="nav-logout">
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </nav>
  );
};

const AppContent = () => {
  return (
    <div className="app">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <CharacterSelect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/battle"
            element={
              <ProtectedRoute>
                <BattlePage />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;