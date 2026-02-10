import axios, { AxiosInstance } from 'axios';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/models';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

    async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/inscription', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

    // Utilisateur
  async getCurrentUser(): Promise<AuthResponse> {
    const response = await this.api.get<AuthResponse>('/utilisateur/me');
    return response.data;
  }

  async updateUserInfo(nom: string, prenom: string): Promise<any> {
    const response = await this.api.put('/utilisateur/info', { nom, prenom });
    return response.data;
  }


  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/connexion', data);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }


    async getSignalements(): Promise<any[]> {
    const response = await this.api.get('/signalement');
    return response.data;
  }



}

export default new ApiService();
