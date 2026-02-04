import React from 'react';
import './SignalementPopup.css';

/**
 * Composant SignalementPopup - Affiche les détails d'un signalement
 * @param {Object} signalement - Les données du signalement
 * @param {Function} onClose - Fonction appelée à la fermeture du popup
 * @param {Function} onUpdate - Fonction appelée pour mettre à jour le signalement
 * @param {Function} onDelete - Fonction appelée pour supprimer le signalement
 */
const SignalementPopup = ({ signalement, onClose, onUpdate, onDelete }) => {
  if (!signalement) return null;

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'OUVERT':
        return '#ff9800';
      case 'EN_COURS':
        return '#2196f3';
      case 'RESOLU':
        return '#4caf50';
      case 'FERME':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'OUVERT':
        return 'Ouvert';
      case 'EN_COURS':
        return 'En cours';
      case 'RESOLU':
        return 'Résolu';
      case 'FERME':
        return 'Fermé';
      default:
        return statut;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>
          ✕
        </button>

        <div className="popup-header">
          <h2 className="popup-title">{signalement.titre || 'Sans titre'}</h2>
          <span 
            className="popup-statut-badge"
            style={{ backgroundColor: getStatutColor(signalement.statut) }}
          >
            {getStatutLabel(signalement.statut)}
          </span>
        </div>

        <div className="popup-body">
          <div className="popup-section">
            <h3 className="popup-section-title">Description</h3>
            <p className="popup-description">
              {signalement.description || 'Aucune description'}
            </p>
          </div>

          <div className="popup-section">
            <h3 className="popup-section-title">Localisation</h3>
            <div className="popup-location">
              <div className="popup-info-item">
                <span className="info-label">Latitude:</span>
                <span className="info-value">{signalement.latitude?.toFixed(6)}</span>
              </div>
              <div className="popup-info-item">
                <span className="info-label">Longitude:</span>
                <span className="info-value">{signalement.longitude?.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {signalement.dateCreation && (
            <div className="popup-section">
              <h3 className="popup-section-title">Date de création</h3>
              <p className="popup-date">{formatDate(signalement.dateCreation)}</p>
            </div>
          )}

          {signalement.dateModification && (
            <div className="popup-section">
              <h3 className="popup-section-title">Dernière modification</h3>
              <p className="popup-date">{formatDate(signalement.dateModification)}</p>
            </div>
          )}

          {signalement.utilisateur && (
            <div className="popup-section">
              <h3 className="popup-section-title">Créé par</h3>
              <p className="popup-user">
                {signalement.utilisateur.prenom} {signalement.utilisateur.nom}
              </p>
            </div>
          )}
        </div>

        <div className="popup-footer">
          {onUpdate && (
            <button className="popup-btn update-btn" onClick={() => onUpdate(signalement)}>
              Modifier
            </button>
          )}
          {onDelete && (
            <button className="popup-btn delete-btn" onClick={() => onDelete(signalement.idSignalement)}>
              Supprimer
            </button>
          )}
          <button className="popup-btn cancel-btn" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignalementPopup;
