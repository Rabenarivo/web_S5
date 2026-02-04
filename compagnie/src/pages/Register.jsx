import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../services/ApiService';

/**
 * Page d'inscription - Réservée aux administrateurs uniquement
 */
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    const user = apiService.getUser();
    if (!user || !user.roles || !user.roles.includes('ADMIN')) {
      navigate('/login');
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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await apiService.register(registerData);

      if (response.success) {
        // Ne pas se connecter automatiquement, juste afficher un message de succès
        alert('Compte créé avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          email: '',
          password: '',
          confirmPassword: '',
          nom: '',
          prenom: '',
        });
      } else {
        setError(response.message || "Échec de l'inscription");
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid d-flex align-items-center justify-content-center py-5" style={{ minHeight: 'calc(100vh - 56px)', background: '#f8f9fa' }}>
      <div className="card shadow-lg border-0" style={{ maxWidth: '550px', width: '100%' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h1 className="display-6 fw-bold">Inscription</h1>
            <p className="text-muted">Créez votre compte gratuitement</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="prenom" className="form-label fw-bold">Prénom</label>
                <input
                  type="text"
                  className="form-control"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  placeholder="Jean"
                  autoComplete="given-name"
                />
              </div>

              <div className="col-md-6">
                <label htmlFor="nom" className="form-label fw-bold">Nom</label>
                <input
                  type="text"
                  className="form-control"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Dupont"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="mb-3 mt-3">
              <label htmlFor="email" className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
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
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label fw-bold">Confirmer le mot de passe</label>
              <input
                type="password"
                className="form-control"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={6}
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
                  Inscription...
                </>
              ) : "S'inscrire"}
            </button>

            <div className="text-center pt-3 border-top">
              <p className="mb-0">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-decoration-none fw-bold">
                  Se connecter
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
