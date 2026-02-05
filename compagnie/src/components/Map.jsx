import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import apiService from '../services/ApiService';
import SignalementPopup from './SignalementPopup';

// Fix pour les icônes Leaflet dans React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icônes personnalisées par statut
const createIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

const icons = {
  OUVERT: createIcon('#ff9800'),
  EN_COURS: createIcon('#2196f3'),
  RESOLU: createIcon('#4caf50'),
  FERME: createIcon('#9e9e9e'),
  default: createIcon('#757575'),
};

// Composant pour gérer les clics sur la carte
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
};

/**
 * Composant de carte pour afficher Antananarivo avec OpenStreetMap
 * Affiche les signalements et permet d'en créer de nouveaux
 */
const Map = ({ 
  center = [-18.8792, 47.5079], 
  zoom = 13, 
  height = '600px',
  onSignalementClick,
  onMapClick 
}) => {
  const [signalements, setSignalements] = useState([]);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les signalements au montage du composant
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

  const handleMarkerClick = (signalement) => {
    setSelectedSignalement(signalement);
    if (onSignalementClick) {
      onSignalementClick(signalement);
    }
  };

  const handleClosePopup = () => {
    setSelectedSignalement(null);
  };

  const handleUpdateSignalement = async (signalement) => {
    // À implémenter: formulaire de modification
    console.log('Modifier signalement:', signalement);
    handleClosePopup();
  };

  const handleDeleteSignalement = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce signalement ?')) {
      try {
        await apiService.deleteSignalement(id);
        await loadSignalements();
        handleClosePopup();
      } catch (err) {
        alert('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  return (
    <>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height, width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        {/* Tuiles OpenStreetMap (en ligne) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Gestionnaire de clics sur la carte */}
        <MapClickHandler onMapClick={onMapClick} />

        {/* Marqueurs pour chaque signalement */}
        {signalements.map((signalement) => {
          const formatDate = (dateString) => {
            if (!dateString) return 'Date inconnue';
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
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

          return (
            <Marker
              key={signalement.idSignalement}
              position={[signalement.latitude, signalement.longitude]}
              icon={icons[signalement.statut] || icons.default}
              eventHandlers={{
                click: () => handleMarkerClick(signalement),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div style={{ minWidth: '200px', fontSize: '0.85rem' }}>
                  <div style={{ 
                    fontWeight: 'bold', 
                    marginBottom: '0.5rem',
                    paddingBottom: '0.3rem',
                    borderBottom: '1px solid #ddd'
                  }}>
                    📍 Signalement
                  </div>
                  
                  <div style={{ marginBottom: '0.3rem' }}>
                    <strong>📅 Date:</strong> {formatDate(signalement.dateCreation)}
                  </div>
                  
                  <div style={{ marginBottom: '0.3rem' }}>
                    <strong>🚦 Statut:</strong> {getStatutLabel(signalement.statut)}
                  </div>
                  
                  {signalement.surfaceM2 && (
                    <div style={{ marginBottom: '0.3rem' }}>
                      <strong>📐 Surface:</strong> {signalement.surfaceM2} m²
                    </div>
                  )}
                  
                  {signalement.budget && (
                    <div style={{ marginBottom: '0.3rem' }}>
                      <strong>💰 Budget:</strong> {parseFloat(signalement.budget).toLocaleString('fr-FR')} Ar
                    </div>
                  )}
                  
                  {signalement.entreprise && (
                    <div style={{ marginBottom: '0.3rem' }}>
                      <strong>🏢 Entreprise:</strong> {signalement.entreprise}
                    </div>
                  )}
                  
                  <div style={{ 
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    Cliquer pour plus de détails
                  </div>
                </div>
              </Tooltip>
              
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                    {signalement.titre || 'Sans titre'}
                  </h3>
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                    {signalement.description || 'Aucune description'}
                  </p>
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.3rem 0.6rem', 
                    borderRadius: '4px',
                    backgroundColor: icons[signalement.statut] ? 
                      (signalement.statut === 'OUVERT' ? '#ff9800' :
                       signalement.statut === 'EN_COURS' ? '#2196f3' :
                       signalement.statut === 'RESOLU' ? '#4caf50' : '#9e9e9e') : '#757575',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 'bold'
                  }}>
                    {signalement.statut}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Popup de détails du signalement */}
      {selectedSignalement && (
        <SignalementPopup
          signalement={selectedSignalement}
          onClose={handleClosePopup}
          onUpdate={handleUpdateSignalement}
          onDelete={handleDeleteSignalement}
        />
      )}

      {/* Affichage des erreurs */}
      {error && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px',
          color: '#c62828'
        }}>
          Erreur: {error}
        </div>
      )}
    </>
  );
};

export default Map;

