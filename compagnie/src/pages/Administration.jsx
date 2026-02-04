import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';

const AdministrationUsers = () => {
  const navigate = useNavigate();

  const [utilisateursBloques, setUtilisateursBloques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const user = apiService.getUser();

    if (!user || !user.roles || !user.roles.includes('ADMIN')) {
      navigate('/login');
      return;
    }

    loadUtilisateursBloques();
  }, [navigate]);

  const loadUtilisateursBloques = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUtilisateursBloqués();
      setUtilisateursBloques(response || []);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs bloqués');
    } finally {
      setLoading(false);
    }
  };

  const handleDebloquerUtilisateur = async (userId) => {
    if (!window.confirm('Voulez-vous vraiment débloquer cet utilisateur ?')) {
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      await fetch(`http://localhost:8080/api/auth/unblock/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setSuccess('Utilisateur débloqué avec succès');
      loadUtilisateursBloques();
    } catch (err) {
      setError('Erreur lors du déblocage de l’utilisateur');
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center text-primary fw-bold">
        Gestion des utilisateurs bloqués
      </h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show">
          {error}
          <button className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show">
          {success}
          <button className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {utilisateursBloques.length === 0 ? (
        <div className="alert alert-info text-center">
          Aucun utilisateur bloqué
        </div>
      ) : (
        <div className="table-responsive shadow-sm">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Email</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Rôles</th>
                <th>État</th>
                <th>Date création</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {utilisateursBloques.map((user) => (
                <tr key={user.idUtilisateur}>
                  <td>{user.email}</td>
                  <td>{user.nom || '-'}</td>
                  <td>{user.prenom || '-'}</td>
                  <td>
                    {user.roles?.length > 0
                      ? user.roles.map((role) => (
                          <span key={role} className="badge bg-secondary me-1">
                            {role}
                          </span>
                        ))
                      : '-'}
                  </td>
                  <td>
                    <span className="badge bg-danger">
                      {user.etat || 'BLOQUE'}
                    </span>
                  </td>
                  <td>
                    {user.dateCreation
                      ? new Date(user.dateCreation).toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleDebloquerUtilisateur(user.idUtilisateur)}
                    >
                      <i className="bi bi-unlock me-1"></i>
                      Débloquer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="alert alert-warning mt-4">
        <strong>Attention :</strong> Le déblocage permet immédiatement à
        l’utilisateur de se reconnecter.
      </div>
    </div>
  );
};

export default AdministrationUsers;
