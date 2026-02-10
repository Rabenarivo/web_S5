// Modèles correspondant aux tables PostgreSQL

export interface Utilisateur {
  id_utilisateur: string; // UUID
  email: string;
  source_auth: 'LOCAL' | 'FIREBASE';
  date_creation: Date;
}

export interface UtilisateurInfo {
  id_utilisateur_info?: number;
  id_utilisateur: string;
  nom?: string;
  prenom?: string;
  date_debut: Date;
  date_fin?: Date;
}

export interface Role {
  id_role: number;
  code: 'VISITEUR' | 'USER' | 'MANAGER';
}

export interface UtilisateurRole {
  id_utilisateur_role?: number;
  id_utilisateur: string;
  id_role: number;
  date_debut: Date;
  date_fin?: Date;
}

export interface EtatCompte {
  id_etat: number;
  code: 'ACTIF' | 'INACTIF' | 'BLOQUE';
}

export interface UtilisateurEtat {
  id_utilisateur_etat?: number;
  id_utilisateur: string;
  id_etat: number;
  raison?: string;
  date_debut: Date;
  date_fin?: Date;
}

export interface Signalement {
  id_signalement: string; // UUID
  id_utilisateur?: string;
  latitude: number;
  longitude: number;
  source?: 'WEB' | 'MOBILE' | 'FIREBASE';
  date_creation: Date;
}

export interface StatutSignalement {
  id_statut: number;
  code: 'NOUVEAU' | 'EN_COURS' | 'TERMINE';
}

export interface SignalementStatut {
  id_signalement_statut?: number;
  id_signalement: string;
  id_statut: number;
  date_debut: Date;
  date_fin?: Date;
}

export interface SignalementDetail {
  id_detail?: number;
  id_signalement: string;
  surface_m2?: number;
  budget?: number;
  id_entreprise?: number;
  date_debut: Date;
  date_fin?: Date;
}

export interface Entreprise {
  id_entreprise?: number;
  nom: string;
}

export interface TentativeConnexion {
  id_tentative?: string;
  id_utilisateur?: string;
  email?: string; // Pour les tentatives sans compte trouvé
  date_tentative: Date;
  succes: boolean;
}

// DTOs pour l'API
export interface RegisterRequest {
  email: string;
  password: string;
  nom?: string;
  prenom?: string;
  source_auth: 'LOCAL' | 'FIREBASE';
  firebase_uid?: string; // Pour Firebase
}

export interface LoginRequest {
  email: string;
  password: string;
  source_auth: 'LOCAL' | 'FIREBASE';
  firebase_uid?: string;
}

export interface AuthResponse {
  utilisateur: Utilisateur;
  info?: UtilisateurInfo;
  role?: Role;
  etat?: EtatCompte;
  token?: string;
}
