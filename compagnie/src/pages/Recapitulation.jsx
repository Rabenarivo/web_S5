import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';

/**
 * Page Récapitulation - Tableau de bord avec statistiques complètes
 */
const Recapitulation = () => {
  const navigate = useNavigate();
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSignalements();
  }, []);

  const loadSignalements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllSignalements();
      setSignalements(data.signalements || data || []);
    } catch (err) {
      console.error('Erreur chargement signalements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calcul des statistiques globales
  const getStatistiquesGlobales = () => {
    const nbTotal = signalements.length;
    
    const totalSurface = signalements.reduce((acc, sig) => {
      return acc + (parseFloat(sig.surfaceM2) || 0);
    }, 0);

    const totalBudget = signalements.reduce((acc, sig) => {
      return acc + (parseFloat(sig.budget) || 0);
    }, 0);

    // Calcul de l'avancement en %
    // OUVERT = 0%, EN_COURS = 50%, RESOLU/FERME = 100%
    const avancement = signalements.reduce((acc, sig) => {
      if (sig.statut === 'OUVERT') return acc + 0;
      if (sig.statut === 'EN_COURS') return acc + 50;
      if (sig.statut === 'RESOLU' || sig.statut === 'FERME') return acc + 100;
      return acc;
    }, 0);

    const avancementPourcentage = nbTotal > 0 ? (avancement / nbTotal).toFixed(2) : 0;

    return {
      nbTotal,
      totalSurface: totalSurface.toFixed(2),
      totalBudget: totalBudget.toFixed(2),
      avancementPourcentage
    };
  };

  // Statistiques par statut
  const getStatistiquesParStatut = () => {
    const statuts = ['OUVERT', 'EN_COURS', 'RESOLU', 'FERME'];
    
    return statuts.map(statut => {
      const signalementsStatut = signalements.filter(s => s.statut === statut);
      const nb = signalementsStatut.length;
      
      const surface = signalementsStatut.reduce((acc, sig) => {
        return acc + (parseFloat(sig.surfaceM2) || 0);
      }, 0);

      const budget = signalementsStatut.reduce((acc, sig) => {
        return acc + (parseFloat(sig.budget) || 0);
      }, 0);

      const pourcentage = signalements.length > 0 
        ? ((nb / signalements.length) * 100).toFixed(1) 
        : 0;

      return {
        statut,
        nb,
        surface: surface.toFixed(2),
        budget: budget.toFixed(2),
        pourcentage
      };
    });
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'OUVERT': return 'Nouveau';
      case 'EN_COURS': return 'En cours';
      case 'RESOLU': return 'Terminé';
      case 'FERME': return 'Fermé';
      default: return statut;
    }
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'OUVERT': return '#ff9800';
      case 'EN_COURS': return '#2196f3';
      case 'RESOLU': return '#4caf50';
      case 'FERME': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const stats = getStatistiquesGlobales();
  const statsParStatut = getStatistiquesParStatut();

  if (loading) {
    return (
      <div className="container-fluid p-0">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4" style={{ background: '#f8f9fa', minHeight: 'calc(100vh - 80px)' }}>
      {/* En-tête */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-4 fw-bold text-center mb-2" style={{ color: '#333' }}>
            📊 Tableau de Récapitulation
          </h1>
          <p className="text-center text-muted">Vue d'ensemble des signalements routiers</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          Erreur: {error}
        </div>
      )}

      {/* Statistiques globales - Cartes */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #667eea' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Nombre de points</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: '#667eea' }}>{stats.nbTotal}</h2>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📍</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #f093fb' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Surface totale</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: '#f093fb' }}>{stats.totalSurface} m²</h2>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📐</div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #4facfe' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Avancement global</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: '#4facfe' }}>{stats.avancementPourcentage}%</h2>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📈</div>
              </div>
              <div className="progress mt-2" style={{ height: '8px' }}>
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${stats.avancementPourcentage}%`, backgroundColor: '#4facfe' }}
                  aria-valuenow={stats.avancementPourcentage} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100" style={{ borderLeft: '4px solid #43e97b' }}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Budget total</h6>
                  <h2 className="mb-0 fw-bold" style={{ color: '#43e97b' }}>
                    {parseFloat(stats.totalBudget).toLocaleString('fr-FR')} Ar
                  </h2>
                </div>
                <div style={{ fontSize: '3rem', opacity: 0.3 }}>💰</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau détaillé par statut */}
      <div className="row">
        <div className="col">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold">Détails par statut</h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="px-4 py-3">Statut</th>
                      <th scope="col" className="text-center py-3">Nombre</th>
                      <th scope="col" className="text-center py-3">Répartition</th>
                      <th scope="col" className="text-end py-3">Surface (m²)</th>
                      <th scope="col" className="text-end py-3">Budget (Ar)</th>
                      <th scope="col" className="px-4 py-3">Progression</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsParStatut.map((stat) => (
                      <tr key={stat.statut}>
                        <td className="px-4 py-3">
                          <div className="d-flex align-items-center">
                            <div 
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: getStatutColor(stat.statut),
                                marginRight: '10px'
                              }}
                            ></div>
                            <strong>{getStatutLabel(stat.statut)}</strong>
                          </div>
                        </td>
                        <td className="text-center py-3">
                          <span className="badge rounded-pill" style={{ 
                            backgroundColor: getStatutColor(stat.statut),
                            fontSize: '0.9rem',
                            padding: '0.5rem 1rem'
                          }}>
                            {stat.nb}
                          </span>
                        </td>
                        <td className="text-center py-3">
                          <strong>{stat.pourcentage}%</strong>
                        </td>
                        <td className="text-end py-3">
                          {parseFloat(stat.surface).toLocaleString('fr-FR')}
                        </td>
                        <td className="text-end py-3">
                          {parseFloat(stat.budget).toLocaleString('fr-FR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="progress" style={{ height: '20px' }}>
                            <div 
                              className="progress-bar" 
                              role="progressbar" 
                              style={{ 
                                width: `${stat.pourcentage}%`,
                                backgroundColor: getStatutColor(stat.statut)
                              }}
                              aria-valuenow={stat.pourcentage} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            >
                              {stat.pourcentage}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-light">
                    <tr className="fw-bold">
                      <td className="px-4 py-3">TOTAL</td>
                      <td className="text-center py-3">
                        <span className="badge bg-secondary rounded-pill" style={{ 
                          fontSize: '0.9rem',
                          padding: '0.5rem 1rem'
                        }}>
                          {stats.nbTotal}
                        </span>
                      </td>
                      <td className="text-center py-3">100%</td>
                      <td className="text-end py-3">
                        {parseFloat(stats.totalSurface).toLocaleString('fr-FR')}
                      </td>
                      <td className="text-end py-3">
                        {parseFloat(stats.totalBudget).toLocaleString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="progress" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${stats.avancementPourcentage}%` }}
                            aria-valuenow={stats.avancementPourcentage} 
                            aria-valuemin="0" 
                            aria-valuemax="100"
                          >
                            {stats.avancementPourcentage}%
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton retour à la carte */}
      <div className="row mt-4">
        <div className="col text-center">
          <button 
            className="btn btn-lg btn-primary px-5"
            onClick={() => navigate('/carte')}
            style={{
              background: '#0d6efd',
              border: 'none'
            }}
          >
            🗺️ Voir la carte
          </button>
        </div>
      </div>
    </div>
  );
};

export default Recapitulation;
