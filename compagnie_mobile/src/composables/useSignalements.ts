import { ref } from 'vue';
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Interface Signalement - Correspond à la structure synchronisée par le backend
 * Backend: FirestoreMapper.signalementToFirestoreDocument()
 */
export interface Signalement {
  id?: string; // Firebase doc ID
  id_signalement?: string; // UUID depuis PostgreSQL
  id_utilisateur?: string; // UUID utilisateur
  latitude: number;
  longitude: number;
  source: 'WEB' | 'MOBILE' | 'FIREBASE';
  date_creation: Date | Timestamp;
  
  // Statut actuel (synchronisé depuis PostgreSQL)
  statut?: 'NOUVEAU' | 'EN_COURS' | 'TERMINE';
  statut_date_debut?: Date | Timestamp;
  
  // Détails actuels (optionnels, synchronisés si renseignés)
  surface_m2?: number;
  budget?: number;
  id_entreprise?: number;
  entreprise_nom?: string;
  
  // Description et photo (ajoutés pour le mobile)
  description?: string;
  photo?: string; // Base64 string de la photo principale
  photos?: string[]; // Tableau de photos en base64
}

export const useSignalements = () => {
  const signalements = ref<Signalement[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Récupérer tous les signalements
   */
  const getAll = async () => {
    loading.value = true;
    error.value = null;
    try {
      const q = query(
        collection(db, 'signalements'),
        orderBy('date_creation', 'desc')
      );
      const querySnapshot = await getDocs(q);
      signalements.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Signalement[];
      return signalements.value;
    } catch (err: any) {
      console.error('Erreur récupération signalements:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer les signalements d'un utilisateur
   */
  const getByUser = async (userId: string) => {
    loading.value = true;
    error.value = null;
    try {
      // Query without orderBy to avoid index requirement
      // Once you create the index in Firebase Console, you can add back: orderBy('date_creation', 'desc')
      const q = query(
        collection(db, 'signalements'),
        where('id_utilisateur', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      signalements.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Signalement[];
      return signalements.value;
    } catch (err: any) {
      console.error('Erreur récupération signalements utilisateur:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupérer un signalement par ID
   */
  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'signalements', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Signalement;
      }
      return null;
    } catch (err: any) {
      console.error('Erreur récupération signalement:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Créer un nouveau signalement
   * Note: Créé directement dans Firestore
   * Le backend peut ensuite synchroniser vers PostgreSQL si nécessaire
   */
  const create = async (data: Omit<Signalement, 'id' | 'date_creation' | 'statut'>) => {
    loading.value = true;
    error.value = null;
    try {
      const signalementData = {
        id_utilisateur: data.id_utilisateur,
        latitude: data.latitude,
        longitude: data.longitude,
        source: data.source || 'MOBILE',
        statut: 'NOUVEAU', // Toujours NOUVEAU à la création
        date_creation: Timestamp.now(),
        // Champs optionnels
        ...(data.surface_m2 && { surface_m2: data.surface_m2 }),
        ...(data.budget && { budget: data.budget }),
        ...(data.description && { description: data.description }),
        ...(data.photo && { photo: data.photo }),
        ...(data.photos && { photos: data.photos })
      };

      const docRef = await addDoc(collection(db, 'signalements'), signalementData);
      console.log('Signalement créé avec ID:', docRef.id);
      
      const newSignalement = { id: docRef.id, ...signalementData };
      signalements.value.unshift(newSignalement as Signalement);
      
      return newSignalement as Signalement;
    } catch (err: any) {
      console.error('Erreur création signalement:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Mettre à jour un signalement
   */
  const update = async (id: string, data: Partial<Signalement>) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'signalements', id);
      await updateDoc(docRef, {
        ...data,
        date_modification: new Date()
      });

      // Mettre à jour localement
      const index = signalements.value.findIndex(s => s.id === id);
      if (index !== -1) {
        signalements.value[index] = {
          ...signalements.value[index],
          ...data,
          date_modification: new Date()
        };
      }

      console.log('Signalement mis à jour:', id);
      return { id, ...data };
    } catch (err: any) {
      console.error('Erreur mise à jour signalement:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Supprimer un signalement
   */
  const remove = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, 'signalements', id);
      await deleteDoc(docRef);

      // Retirer localement
      signalements.value = signalements.value.filter(s => s.id !== id);
      
      console.log('Signalement supprimé:', id);
      return id;
    } catch (err: any) {
      console.error('Erreur suppression signalement:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Changer le statut d'un signalement
   */
  const updateStatus = async (id: string, statut: 'NOUVEAU' | 'EN_COURS' | 'TERMINE') => {
    return update(id, { statut });
  };

  return {
    signalements,
    loading,
    error,
    getAll,
    getByUser,
    getById,
    create,
    update,
    remove,
    updateStatus
  };
};
