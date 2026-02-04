import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/ApiService';


const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = apiService.isAuthenticated();

  const handleLogout = () => {
    apiService.logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom">
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <span className="fs-3 me-2 text-primary">📍</span>
          <span className="fw-bold text-dark">Compagnie</span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/')}`}>
                Accueil
              </Link>
            </li>

            {isAuthenticated ? (
              (() => {
                const user = apiService.getUser();
                const isAdmin = user && user.roles && user.roles.includes('ADMIN');
                return (
                  <>

                    {isAdmin && (
                      <li className="nav-item">
                        <Link to="/administration" className={`nav-link ${isActive('/administration')}`}>
                          Administration
                        </Link>
                      </li>
                    )}
                    <li className="nav-item">
                      <button onClick={handleLogout} className="btn btn-outline-danger ms-2">
                        Déconnexion
                      </button>
                    </li>
                  </>
                );
              })()
            ) : (
              <>
                <li className="nav-item">
                  <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                    Connexion
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/register" className="btn btn-light ms-2">
                    Inscription
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
