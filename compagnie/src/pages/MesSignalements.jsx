import React, { useEffect, useState } from 'react';
import apiService from '../services/ApiService';
import { useNavigate } from 'react-router-dom';
import Map from '../components/Map';


const MesSignalements = () => {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = apiService.getUser();
    if (!user || user.idUtilisateur !== 2 || user.role !== 'USER') {
      navigate('/login');
      return;
    }
    loadSignalements(user.idUtilisateur);
  }, [navigate]);

  const loadSignalements = async (idUtilisateur) => {
    try {
      setLoading(true);
      setError(null);
      // Appel à l'API pour récupérer les signalements de l'utilisateur
      const all = await apiService.getAllSignalements();
      // Filtrer côté front car l'API ne propose pas de filtre par utilisateur
      const list = (all.signalements || all || []).filter(sig => sig.idUtilisateur === 2);
      setSignalements(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques
  const getStatistiques = () => {
    const stats = {
      total: signalements.length,
      OUVERT: 0,
      EN_COURS: 0,
      RESOLU: 0,
      FERME: 0
    };

    signalements.forEach(sig => {
      if (sig.statut && stats.hasOwnProperty(sig.statut)) {
        stats[sig.statut]++;
      }
    });

    return stats;
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

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'OUVERT': return 'Ouvert';
      case 'EN_COURS': return 'En cours';
      case 'RESOLU': return 'Résolu';
      case 'FERME': return 'Fermé';
      default: return statut;
    }
  };

  const stats = getStatistiques();

  if (loading) {
    return (
      <div className="container py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <div className="container">
        <h1 className="mb-4 fw-bold text-center" style={{ color: '#0d6efd' }}>Mes Signalements</h1>
        
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        {/* Statistiques / Récapitulation */}
        <div className="row g-3 mb-4">
          <div className="col-md-3 col-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <h3 className="fw-bold text-primary mb-0">{stats.total}</h3>
                <p className="text-muted mb-0 small">Total</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <h3 className="fw-bold text-warning mb-0">{stats.OUVERT}</h3>
                <p className="text-muted mb-0 small">Ouvert</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <h3 className="fw-bold text-primary mb-0">{stats.EN_COURS}</h3>
                <p className="text-muted mb-0 small">En Cours</p>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="card text-center border-0 shadow-sm">
              <div className="card-body">
                <h3 className="fw-bold text-success mb-0">{stats.RESOLU}</h3>
                <p className="text-muted mb-0 small">Résolu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte avec les signalements */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <Map 
              center={[-18.8792, 47.5079]}
              zoom={13}
              height="500px"
            />
          </div>
        </div>

        {/* Liste des signalements */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Liste de mes signalements ({signalements.length})</h5>
          </div>
          <div className="card-body p-0">
            {signalements.length === 0 ? (
              <div className="alert alert-info m-3 text-center">
                Aucun signalement trouvé.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Surface (m²)</th>
                      <th>Budget (Ar)</th>
                      <th>Entreprise</th>
                      <th>Latitude</th>
                      <th>Longitude</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signalements.map(sig => (
                      <tr key={sig.idSignalement}>
                        <td className="small">
                          {sig.dateCreation ? new Date(sig.dateCreation).toLocaleString('fr-FR') : '-'}
                        </td>
                        <td>
                          <span className={`badge bg-${getStatutColor(sig.statut)}`}>
                            {getStatutLabel(sig.statut)}
                          </span>
                        </td>
                        <td>{sig.surfaceM2 || '-'}</td>
                        <td>{sig.budget ? parseFloat(sig.budget).toLocaleString('fr-FR') : '-'}</td>
                        <td>{sig.entreprise || '-'}</td>
                        <td className="small">{sig.latitude ? sig.latitude.toFixed(4) : '-'}</td>
                        <td className="small">{sig.longitude ? sig.longitude.toFixed(4) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MesSignalements;
