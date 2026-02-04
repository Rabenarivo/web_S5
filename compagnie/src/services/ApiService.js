/**
 * Service pour gérer les appels API
 * Base URL: http://localhost:8080
 */

const BASE_URL = 'http://localhost:8080';

class ApiService {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  /**
   * Récupère l'utilisateur stocké dans le localStorage
   */
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Stocke l'utilisateur dans le localStorage
   */
  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Supprime l'utilisateur du localStorage
   */
  removeUser() {
    localStorage.removeItem('user');
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated() {
    return !!this.getUser();
  }

  /**
   * Récupère les headers pour les requêtes HTTP
   */
  getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json',
    };

    return headers;
  }

  /**
   * Gère les erreurs HTTP
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `Erreur HTTP ${response.status}`,
      }));
      throw new Error(error.message || 'Une erreur est survenue');
    }
    return response.json();
  }

  // ==================== AUTHENTIFICATION ====================

  async ping() {
    const response = await fetch(`${this.baseUrl}/api/auth/ping`);
    return response.text();
  }



  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify(credentials),
    });
    const data = await this.handleResponse(response);
    
    if (data.success && data.utilisateur) {
      this.setUser(data.utilisateur);
    }
    
    return data;
  }

    async getUtilisateursBloqués() {
    const response = await fetch(`${this.baseUrl}/api/auth/blocked-users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // ==================== SIGNALEMENTS ====================
  async getAllSignalements() {
    const response = await fetch(`${this.baseUrl}/api/signalements`, {
      headers: this.getHeaders(false),
    });
    return this.handleResponse(response);
  }

  /**
   * Récupère un signalement par son ID
   * @param {string} id - ID du signalement
   */
    async getSignalementById(id) {
      const response = await fetch(`${this.baseUrl}/api/signalements/${id}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    }

    async deleteSignalement(id) {
    const response = await fetch(`${this.baseUrl}/api/signalements/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }


    async updateSignalement(data) {
    const response = await fetch(`${this.baseUrl}/api/signalements`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

    async getEntreprises() {
    const response = await fetch(`${this.baseUrl}/api/entreprises`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

}




// Instance singleton du service
const apiService = new ApiService();

export default apiService;
