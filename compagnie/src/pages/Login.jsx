import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';

/**
 * Page de connexion - Réservée aux administrateurs uniquement
 */
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Vérifier si l'utilisateur est déjà authentifié et admin
  useEffect(() => {
    const user = apiService.getUser();
    if (user && user.roles && user.roles.includes('ADMIN')) {
      setIsAdmin(true);
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiService.login(formData);
      
      if (response.success) {
        // Vérifier que l'utilisateur connecté est admin
        const user = apiService.getUser();
        if (user && user.roles && user.roles.includes('ADMIN')) {
          navigate('/dashboard');
        } else {
          apiService.logout();
          setError('❌ Accès refusé. Seuls les administrateurs peuvent se connecter sur cette interface.');
        }
      } else {
        setError(response.message || 'Échec de la connexion');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center" style={{ minHeight: 'calc(100vh - 56px)', background: '#f8f9fa' }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: '450px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h1 className="display-6 fw-bold">🔐 Accès Administrateur</h1>
            <p className="text-muted">Interface réservée aux administrateurs</p>
          </div>

          <div className="alert alert-info" role="alert">
            <strong>ℹ️ Information :</strong> Seuls les administrateurs peuvent accéder à cette page. Les utilisateurs standards doivent utiliser l'application mobile.
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@exemple.com"
                autoComplete="email"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-bold">Mot de passe</label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-100 py-2 mb-3"
              disabled={loading}
              style={{ background: '#0d6efd', border: 'none' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Connexion...
                </>
              ) : 'Se connecter'}
            </button>

            <div className="alert alert-warning mt-4" role="alert">
              <small>
                <strong>📱 Utilisateurs standards :</strong> Utilisez l'application mobile Ionic pour accéder à vos signalements.
              </small>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
