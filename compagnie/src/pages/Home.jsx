import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Page d'accueil de l'application avec Bootstrap 5
 */
const Home = () => {
  return (
    <div className="container-fluid p-0">
      <div className="p-5 text-center text-white" style={{ background: '#0d6efd' }}>
        <div className="container">
          <span className="display-1 d-block mb-3">📍</span>
          <h1 className="display-3 fw-bold mb-3">Bienvenue sur Compagnie</h1>
          <p className="lead fs-4 mb-4">
            Plateforme de gestion des signalements citoyens à Antananarivo
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register" className="btn btn-light btn-lg px-5 py-3 fw-bold">
              Commencer maintenant
            </Link>
            <Link to="/carte" className="btn btn-outline-light btn-lg px-5 py-3 fw-bold">
              Voir la carte
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm hover-lift">
              <div className="card-body text-center p-4">
                <div className="display-1 mb-3">🗺️</div>
                <h3 className="h4 mb-3">Carte interactive</h3>
                <p className="text-muted mb-3">Visualisez et créez des signalements directement sur la carte d'Antananarivo</p>
                <Link to="/carte" className="btn btn-link text-decoration-none fw-bold">
                  Voir la carte →
                </Link>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm hover-lift">
              <div className="card-body text-center p-4">
                <div className="display-1 mb-3">📊</div>
                <h3 className="h4 mb-3">Suivi en temps réel</h3>
                <p className="text-muted">Suivez l'état de vos signalements et ceux de votre quartier</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 border-0 shadow-sm hover-lift">
              <div className="card-body text-center p-4">
                <div className="display-1 mb-3">🤝</div>
                <h3 className="h4 mb-3">Collaboration</h3>
                <p className="text-muted">Travaillez ensemble pour améliorer votre ville</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <h2 className="display-5 fw-bold mb-5">Comment ça marche ?</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  1
                </div>
                <h4 className="mb-3">Créez un compte</h4>
                <p className="text-muted">Inscrivez-vous gratuitement en quelques secondes</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  2
                </div>
                <h4 className="mb-3">Signalez un problème</h4>
                <p className="text-muted">Cliquez sur la carte pour créer un signalement</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  3
                </div>
                <h4 className="mb-3">Suivez les progrès</h4>
                <p className="text-muted">Recevez des mises à jour sur vos signalements</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
