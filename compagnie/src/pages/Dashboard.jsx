import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/ApiService';
import Map from '../components/Map';

/**
 * Page Dashboard - Tableau de bord principal
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    statut: 'OUVERT',
  });

  useEffect(() => {
    if (!apiService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadUserData();
    loadSignalements();
  }, [navigate]);

  const loadUserData = async () => {
    try {
      const userData = apiService.getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
      navigate('/login');
    }
  };

  const loadSignalements = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllSignalements();
      setSignalements(data.signalements || data || []);
    } catch (err) {
      console.error('Erreur chargement signalements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
    setShowCreateForm(true);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateSignalement = async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert('Veuillez sélectionner un emplacement sur la carte');
      return;
    }

    try {
      const signalementData = {
        ...formData,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      };

      await apiService.createSignalement(signalementData);
      
      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        statut: 'OUVERT',
      });
      setSelectedLocation(null);
      setShowCreateForm(false);
      
      // Recharger les signalements
      await loadSignalements();
      
      alert('Signalement créé avec succès !');
    } catch (err) {
      alert('Erreur lors de la création: ' + err.message);
    }
  };

  const getStatutStats = () => {
    const stats = {
      OUVERT: 0,
      EN_COURS: 0,
      RESOLU: 0,
      FERME: 0,
    };

    signalements.forEach(s => {
      if (stats.hasOwnProperty(s.statut)) {
        stats[s.statut]++;
      }
    });

    return stats;
  };

  const stats = getStatutStats();

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="display-5 fw-bold">Tableau de bord</h1>
          {user && (
            <p className="lead text-muted">
              Bienvenue, {user.prenom} {user.nom}
            </p>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center">
              <h3 className="display-6 text-primary mb-1">{signalements.length}</h3>
              <small className="text-muted text-uppercase fw-bold">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-warning border-4">
            <div className="card-body text-center">
              <h3 className="display-6 text-warning mb-1">{stats.OUVERT}</h3>
              <small className="text-muted text-uppercase fw-bold">Ouverts</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-info border-4">
            <div className="card-body text-center">
              <h3 className="display-6 text-info mb-1">{stats.EN_COURS}</h3>
              <small className="text-muted text-uppercase fw-bold">En cours</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm border-start border-success border-4">
            <div className="card-body text-center">
              <h3 className="display-6 text-success mb-1">{stats.RESOLU}</h3>
              <small className="text-muted text-uppercase fw-bold">Résolus</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white border-0 py-3">
              <h2 className="h4 mb-1">Carte des signalements</h2>
              <p className="text-muted mb-0"><small>Cliquez sur la carte pour créer un nouveau signalement</small></p>
            </div>
            <div className="card-body p-0">
              <Map height="500px" onMapClick={handleMapClick} />
            </div>
          </div>
        </div>

        {showCreateForm && selectedLocation && (
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h3 className="h5 mb-0">Créer un signalement</h3>
              </div>
              <div className="card-body">
                <div className="alert alert-info mb-3">
                  📍 Position: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
                
                <form onSubmit={handleCreateSignalement}>
                  <div className="mb-3">
                    <label htmlFor="titre" className="form-label fw-bold">Titre</label>
                    <input
                      type="text"
                      className="form-control"
                      id="titre"
                      name="titre"
                      value={formData.titre}
                      onChange={handleFormChange}
                      required
                      placeholder="Ex: Nid de poule sur Avenue de l'Indépendance"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-bold">Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      required
                      placeholder="Décrivez le problème en détail..."
                      rows="4"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="statut" className="form-label fw-bold">Statut</label>
                    <select
                      className="form-select"
                      id="statut"
                      name="statut"
                      value={formData.statut}
                      onChange={handleFormChange}
                    >
                      <option value="OUVERT">Ouvert</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="RESOLU">Résolu</option>
                      <option value="FERME">Fermé</option>
                    </select>
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary flex-fill">
                      Créer le signalement
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        setSelectedLocation(null);
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
