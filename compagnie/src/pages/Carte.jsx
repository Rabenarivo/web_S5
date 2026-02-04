import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import SignalementPopup from '../components/SignalementPopup';
import apiService from '../services/ApiService';

/**
 * Page Carte - Accessible à tous (publique) avec Bootstrap 5
 * Affiche la carte avec tous les signalements
 */
const Carte = () => {
  const [signalements, setSignalements] = useState([]);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    loadSignalements();
  }, []);

  const loadSignalements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAllSignalements();
      setSignalements(Array.isArray(data) ? data : (data.signalements || []));
    } catch (err) {
      console.error('Erreur chargement signalements:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignalementClick = (signalement) => {
    setSelectedSignalement(signalement);
  };

  const handleClosePopup = () => {
    setSelectedSignalement(null);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setSyncMessage(null);
      
      console.log('Début de la synchronisation Firebase...');
      const result = await apiService.syncFirebase();
      console.log('Résultat de la synchronisation:', result);
      
      if (result.status === 'success') {
        let message = `Synchronisation réussie ! ${result.created || 0} créés, ${result.updated || 0} mis à jour`;
        
        if (result.errors > 0) {
          message += `, ${result.errors} erreurs`;
          if (result.errorDetails && result.errorDetails.length > 0) {
            console.error('Détails des erreurs:', result.errorDetails);
            message += '. Voir la console pour les détails.';
          }
        }
        
        setSyncMessage({
          type: result.errors > 0 ? 'warning' : 'success',
          text: message
        });
        
        // Recharger les signalements
        await loadSignalements();
      } else {
        setSyncMessage({
          type: 'warning',
          text: result.message || 'Synchronisation terminée avec des avertissements'
        });
      }
    } catch (err) {
      console.error('Erreur synchronisation:', err);
      setSyncMessage({
        type: 'danger',
        text: `Erreur: ${err.message}`
      });
    } finally {
      setSyncing(false);
      // Masquer le message après 8 secondes
      setTimeout(() => setSyncMessage(null), 8000);
    }
  };

  return (
    <div className="container-fluid p-0" style={{ height: 'calc(100vh - 56px)' }}>
      <div className="row g-0 h-100">
        <div className="col-12">
          <div className="p-4 bg-light">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h1 className="display-5 fw-bold mb-0">Carte des Signalements</h1>
              <button 
                className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <span className="spinner-border spinner-border-sm"></span>
                    Synchronisation...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                      <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                    Synchroniser Firebase
                  </>
                )}
              </button>
            </div>
            <p className="text-center text-muted mb-4">
              Découvrez tous les signalements routiers à Antananarivo
            </p>

            {syncMessage && (
              <div className={`alert alert-${syncMessage.type} text-center mb-3`}>
                {syncMessage.text}
              </div>
            )}

            {loading && (
              <div className="alert alert-info text-center">
                <div className="spinner-border spinner-border-sm me-2"></div>
                Chargement de la carte...
              </div>
            )}

            {error && (
              <div className="alert alert-danger text-center">
                <strong>Erreur:</strong> {error}
              </div>
            )}

            <div className="row g-2 mb-4">
              <div className="col-6 col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="display-6 text-primary mb-0">{signalements.length}</h3>
                    <small className="text-muted text-uppercase">Signalements</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="display-6 text-warning mb-0">
                      {signalements.filter(s => s.statut === 'OUVERT').length}
                    </h3>
                    <small className="text-muted text-uppercase">Ouverts</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="display-6 text-info mb-0">
                      {signalements.filter(s => s.statut === 'EN_COURS').length}
                    </h3>
                    <small className="text-muted text-uppercase">En cours</small>
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card text-center border-0 shadow-sm">
                  <div className="card-body">
                    <h3 className="display-6 text-success mb-0">
                      {signalements.filter(s => s.statut === 'RESOLU').length}
                    </h3>
                    <small className="text-muted text-uppercase">Résolus</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="position-relative" style={{ height: 'calc(100vh - 400px)', minHeight: '500px' }}>
            <Map 
              height="100%" 
              onSignalementClick={handleSignalementClick}
            />
          </div>

          {!apiService.isAuthenticated() && (
            <div className="alert alert-info mx-4 mt-3 text-center">
              💡 <strong>Astuce :</strong> Connectez-vous pour créer vos propres signalements
            </div>
          )}
        </div>
      </div>

      {selectedSignalement && (
        <SignalementPopup
          signalement={selectedSignalement}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
};

export default Carte;
