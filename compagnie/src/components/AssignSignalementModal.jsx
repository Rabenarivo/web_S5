import React, { useState, useEffect } from 'react';
import apiService from '../services/ApiService';

/**
 * Modal pour assigner un signalement à une entreprise avec surface et budget
 */
const AssignSignalementModal = ({ signalement, show, onClose, onSuccess }) => {
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    idEntreprise: '',
    surfaceM2: '',
    budget: ''
  });

  useEffect(() => {
    if (show) {
      loadEntreprises();
      // Pré-remplir si des données existent déjà
      if (signalement) {
        setFormData({
          idEntreprise: signalement.idEntreprise || '',
          surfaceM2: signalement.surfaceM2 || '',
          budget: signalement.budget || ''
        });
      }
    }
  }, [show, signalement]);

  const loadEntreprises = async () => {
    try {
      const data = await apiService.getEntreprises();
      setEntreprises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement entreprises:', err);
      setError('Impossible de charger les entreprises');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updateData = {
        idSignalement: signalement.idSignalement,
        idEntreprise: formData.idEntreprise ? parseInt(formData.idEntreprise) : null,
        surfaceM2: formData.surfaceM2 ? parseFloat(formData.surfaceM2) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null
      };

      await apiService.updateSignalement(updateData);
      
      if (onSuccess) {
        onSuccess();
      }
      handleClose();
    } catch (err) {
      console.error('Erreur assignation:', err);
      setError(err.message || 'Erreur lors de l\'assignation');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      idEntreprise: '',
      surfaceM2: '',
      budget: ''
    });
    setError(null);
    onClose();
  };

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show" 
        onClick={handleClose}
        style={{ zIndex: 1050 }}
      ></div>

      {/* Modal */}
      <div 
        className="modal fade show d-block" 
        tabIndex="-1" 
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-building me-2"></i>
                Assigner le signalement
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleClose}
                disabled={loading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-geo-alt me-2"></i>
                    Localisation
                  </label>
                  <p className="text-muted small mb-0">
                    Lat: {signalement?.latitude?.toFixed(6)}, 
                    Long: {signalement?.longitude?.toFixed(6)}
                  </p>
                </div>

                <div className="mb-3">
                  <label htmlFor="idEntreprise" className="form-label fw-semibold">
                    <i className="bi bi-building me-2"></i>
                    Entreprise *
                  </label>
                  <select
                    id="idEntreprise"
                    name="idEntreprise"
                    className="form-select"
                    value={formData.idEntreprise}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionner une entreprise</option>
                    {entreprises.map(entreprise => (
                      <option key={entreprise.idEntreprise} value={entreprise.idEntreprise}>
                        {entreprise.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="surfaceM2" className="form-label fw-semibold">
                    <i className="bi bi-rulers me-2"></i>
                    Surface (m²) *
                  </label>
                  <input
                    type="number"
                    id="surfaceM2"
                    name="surfaceM2"
                    className="form-control"
                    value={formData.surfaceM2}
                    onChange={handleChange}
                    placeholder="Ex: 150.5"
                    step="0.01"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="budget" className="form-label fw-semibold">
                    <i className="bi bi-currency-dollar me-2"></i>
                    Budget (Ar) *
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    className="form-control"
                    value={formData.budget}
                    onChange={handleChange}
                    placeholder="Ex: 5000000"
                    step="0.01"
                    min="0"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="alert alert-info small mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Cette assignation créera un nouveau détail pour ce signalement.
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Assignation...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Assigner
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssignSignalementModal;
