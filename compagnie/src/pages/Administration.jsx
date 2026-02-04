import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';

const AdministrationUsers = () => {
  const navigate = useNavigate();

  const [signalements, setSignalements] = useState([]);
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
    loadSignalements();
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

  ////////////////////////////SIGNALEMENT/////////////////////////////////////
    const loadSignalements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllSignalements();
      setSignalements(response.signalements || response || []);
    } catch (err) {
      setError('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };


    const handleUpdateStatut = async (idSignalement, statut) => {
    try {
      setError(null);
      setSuccess(null);

      await apiService.updateSignalement({
        idSignalement,
        statut,
      });

      setSuccess('Statut mis à jour avec succès');
      loadSignalements();
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut');
    }
  };



  const handleDeleteSignalement = async (idSignalement) => {
    if (!window.confirm('Supprimer ce signalement ?')) return;

    try {
      setError(null);
      setSuccess(null);

      await apiService.deleteSignalement(idSignalement);

      setSuccess('Signalement supprimé');
      loadSignalements();
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleAssign = (signalement) => {
    setSelectedSignalement(signalement);
    setShowAssignModal(true);
  };

  const handleAssignSuccess = () => {
    setSuccess('Signalement assigné avec succès');
    loadSignalements();
  };


    const getStatutColor = (statut) => {
    switch (statut) {
      case 'OUVERT': return 'warning';
      case 'EN_COURS': return 'primary';
      case 'RESOLU': return 'success';
      case 'FERME': return 'secondary';
      default: return 'secondary';
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
      Administration
    </h2>

    {/* Alerts */}
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

    {/* Tabs */}
    <ul className="nav nav-tabs mb-4">
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'signalements' ? 'active' : ''}`}
          onClick={() => setActiveTab('signalements')}
        >
          Gestion des signalements
        </button>
      </li>
      <li className="nav-item">
        <button
          className={`nav-link ${activeTab === 'utilisateurs' ? 'active' : ''}`}
          onClick={() => setActiveTab('utilisateurs')}
        >
          Utilisateurs bloqués
        </button>
      </li>
    </ul>

    {/* ================= SIGNALMENTS ================= */}
    {activeTab === 'signalements' && (
      <>
        {signalements.length === 0 ? (
          <div className="alert alert-info text-center">
            Aucun signalement trouvé
          </div>
        ) : (
          <div className="table-responsive shadow-sm">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Date</th>
                  <th>Utilisateur</th>
                  <th>Localisation</th>
                  <th>Statut</th>
                  <th>Surface (m²)</th>
                  <th>Budget (Ar)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {signalements.map((sig) => (
                  <tr key={sig.idSignalement}>
                    <td>
                      {sig.dateCreation
                        ? new Date(sig.dateCreation).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td>
                      {sig.idUtilisateur
                        ? sig.idUtilisateur.toString().substring(0, 8) + '...'
                        : 'Anonyme'}
                    </td>
                    <td>
                      {sig.latitude?.toFixed(4) || '-'},
                      {sig.longitude?.toFixed(4) || '-'}
                    </td>
                    <td>
                      <select
                        className={`form-select form-select-sm bg-${getStatutColor(sig.statut)} text-white`}
                        value={sig.statut}
                        onChange={(e) =>
                          handleUpdateStatut(sig.idSignalement, e.target.value)
                        }
                      >
                        <option value="OUVERT">Ouvert</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="RESOLU">Résolu</option>
                        <option value="FERME">Fermé</option>
                      </select>
                    </td>
                    <td>{sig.surfaceM2 || '-'}</td>
                    <td>
                      {sig.budget
                        ? Number(sig.budget).toLocaleString('fr-FR')
                        : '-'}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAssign(sig)}
                        >
                          <i className="bi bi-building me-1"></i>
                          Assigner
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteSignalement(sig.idSignalement)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    )}

    {/* ================= USERS ================= */}
    {activeTab === 'utilisateurs' && (
      <>
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
      </>
    )}

  </div>
);

      
};

export default AdministrationUsers;
