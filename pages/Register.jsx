import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../src/components/ui/Button';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('JOUEUR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <img src="/images/logo-game-fight.png" alt="Game Fight" />
        </div>
        <h1 className="auth-title">Game Fight</h1>
        <h2>Inscription</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength="3"
              placeholder="Votre pseudo"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="votre@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="6"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength="6"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Rôle</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="JOUEUR">Joueur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Inscription...' : 'S\'inscrire'}
          </Button>
        </form>

        <p className="auth-link">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
