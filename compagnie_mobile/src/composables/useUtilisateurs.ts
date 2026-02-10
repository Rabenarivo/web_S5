import { ref } from 'vue';
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Interface Utilisateur - Correspond à la structure synchronisée par le backend
 * Backend: FirestoreMapper.utilisateurToFirestoreDocument()
 */
export interface Utilisateur {
  id?: string; // Firebase doc ID
  id_utilisateur: string; // UUID depuis PostgreSQL
  email: string;
  source_auth: 'LOCAL' | 'FIREBASE';
  date_creation: Date | Timestamp;
  
  // Informations actuelles (synchronisées depuis PostgreSQL)
  nom?: string;
  prenom?: string;
  
  // Rôle actuel
  role?: 'VISITEUR' | 'USER' | 'MANAGER' | 'ADMIN';
  
  // État du compte
  etat_compte?: 'ACTIF' | 'INACTIF' | 'BLOQUE';
}

export const useUtilisateurs = () => {
  const utilisateurs = ref<Utilisateur[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Récupérer tous les utilisateurs
   */
  const getAll = async () => {
    loading.value = true;
    error.value = null;
    try {
      const querySnapshot = await getDocs(collection(db, 'utilisateurs'));
      utilisateurs.value = querySnapshot.docs
        .filter(doc => doc.id !== '_metadata') // Exclure le document metadata
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Utilisateur[];
      return utilisateurs.value;
    } catch (err: any) {
      console.error('Erreur récupération utilisateurs:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer un utilisateur par ID (UUID PostgreSQL ou Firebase doc ID)
   */
  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Essayer d'abord par document ID
      const docRef = doc(db, 'utilisateurs', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Utilisateur;
      }

      // Sinon essayer par id_utilisateur (UUID PostgreSQL)
      const q = query(
        collection(db, 'utilisateurs'),
        where('id_utilisateur', '==', id)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Utilisateur;
      }

      return null;
    } catch (err: any) {
      console.error('Erreur récupération utilisateur:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Rechercher un utilisateur par email
   */
  const getByEmail = async (email: string) => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, 'utilisateurs'),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Utilisateur;
      }
      
      return null;
    } catch (err: any) {
      console.error('Erreur recherche utilisateur:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer les utilisateurs par rôle
   */
  const getByRole = async (role: string) => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, 'utilisateurs'),
        where('role', '==', role)
      );
      const querySnapshot = await getDocs(q);
      utilisateurs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Utilisateur[];
      return utilisateurs.value;
    } catch (err: any) {
      console.error('Erreur récupération utilisateurs par rôle:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer les utilisateurs par état
   */
  const getByEtat = async (etat: 'ACTIF' | 'INACTIF' | 'BLOQUE') => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, 'utilisateurs'),
        where('etat_compte', '==', etat)
      );
      const querySnapshot = await getDocs(q);
      utilisateurs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Utilisateur[];
      return utilisateurs.value;
    } catch (err: any) {
      console.error('Erreur récupération utilisateurs par état:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    utilisateurs,
    loading,
    error,
    getAll,
    getById,
    getByEmail,
    getByRole,
    getByEtat
  };
};
