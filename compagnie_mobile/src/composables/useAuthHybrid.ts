import { ref, computed } from 'vue';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { TentativeConnexion } from '../types/models';

// Types pour Firestore
interface UserProfile {
  email: string;
  nom?: string;
  prenom?: string;
  role: 'VISITEUR' | 'USER' | 'MANAGER';
  etat: 'ACTIF' | 'INACTIF' | 'BLOQUE';
  source_auth: 'FIREBASE';
  date_creation: Date;
  date_modification?: Date;
  raison_blocage?: string;
}

interface AuthResponse {
  utilisateur: {
    id_utilisateur: string;
    email: string;
    source_auth: 'FIREBASE';
    date_creation?: Date;
  };
  info?: {
    nom?: string;
    prenom?: string;
  };
  role: {
    code: 'VISITEUR' | 'USER' | 'MANAGER';
  };
  etat: {
    code: 'ACTIF' | 'INACTIF' | 'BLOQUE';
  };
  firebaseUser: User;
  tentativesRestantes?: number;
}

const MAX_TENTATIVES = 3;
const firebaseUser = ref<User | null>(null);
const userProfile = ref<AuthResponse | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

// Charger l'utilisateur depuis localStorage au démarrage
const storedUser = localStorage.getItem('userProfile');
if (storedUser) {
  try {
    userProfile.value = JSON.parse(storedUser);
  } catch (e) {
    localStorage.removeItem('userProfile');
  }
}

// Monitor Firebase authentication state
onAuthStateChanged(auth, async (currentUser) => {
  firebaseUser.value = currentUser;
  if (currentUser) {
    // Charger le profil depuis Firestore en cherchant par email
    try {
      const q = query(
        collection(db, 'utilisateurs'),
        where('email', '==', currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const data = userDoc.data() as UserProfile;
        
        // Corriger l'état du compte si non défini ou invalide
        if (!data.etat || (data.etat !== 'ACTIF' && data.etat !== 'BLOQUE' && data.etat !== 'INACTIF')) {
          console.log('État du compte non défini ou invalide, mise à jour vers ACTIF');
          await updateDoc(userDoc.ref, {
            etat: 'ACTIF',
            date_modification: new Date()
          });
          data.etat = 'ACTIF';
        }
        
        userProfile.value = {
          utilisateur: {
            id_utilisateur: currentUser.uid,
            email: currentUser.email || '',
            source_auth: 'FIREBASE',
            date_creation: data.date_creation
          },
          info: {
            nom: data.nom,
            prenom: data.prenom
          },
          role: {
            code: data.role
          },
          etat: {
            code: data.etat
          },
          firebaseUser: currentUser
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile.value));
      }
    } catch (err) {
      console.error('Erreur chargement profil:', err);
    }
  } else {
    userProfile.value = null;
    localStorage.removeItem('userProfile');
  }
});

export const useAuthHybrid = () => {
  const user = computed(() => userProfile.value);
  const isAuthenticated = computed(() => !!firebaseUser.value && !!userProfile.value);

  /**
   * Enregistrer une tentative de connexion dans Firestore
   */
  const enregistrerTentative = async (email: string, userId: string | null, succes: boolean) => {
    try {
      const tentativeData: any = {
        email: email,
        date_tentative: new Date(),
        succes: succes
      };
      
      // Ajouter id_utilisateur seulement s'il existe (Firestore n'accepte pas undefined)
      if (userId) {
        tentativeData.id_utilisateur = userId;
      }
      
      await addDoc(collection(db, 'tentatives_connexion'), tentativeData);
      console.log('Tentative de connexion enregistrée:', succes ? 'Succès' : 'Échec');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la tentative:', error);
      // Ne pas bloquer la connexion si l'enregistrement échoue
    }
  };

  /**
   * Compter les échecs consécutifs récents pour un email
   */
  const compterEchecsConsecutifs = async (email: string): Promise<number> => {
    try {
      // Récupérer toutes les tentatives pour cet email
      // Note: orderBy nécessite un index composite dans Firestore
      // Pour créer l'index, cliquez sur le lien dans l'erreur de console
      const q = query(
        collection(db, 'tentatives_connexion'),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      // Trier manuellement par date (évite de créer un index)
      const tentatives = querySnapshot.docs
        .map(doc => doc.data() as TentativeConnexion)
        .sort((a, b) => {
          const dateA = a.date_tentative instanceof Date ? a.date_tentative : (a.date_tentative as any).toDate();
          const dateB = b.date_tentative instanceof Date ? b.date_tentative : (b.date_tentative as any).toDate();
          return dateB.getTime() - dateA.getTime(); // Décroissant (plus récent en premier)
        });
      
      let count = 0;
      
      // Compter les échecs consécutifs jusqu'au premier succès
      for (const tentative of tentatives) {
        if (tentative.succes) {
          break; // Arrêter au premier succès
        }
        count++;
      }
      
      console.log(`Échecs consécutifs pour ${email}: ${count}`);
      return count;
    } catch (error) {
      console.error('Erreur lors du comptage des échecs:', error);
      return 0; // En cas d'erreur, ne pas bloquer
    }
  };

  /**
   * Bloquer un compte utilisateur dans Firestore
   */
  const bloquerCompte = async (email: string, userId: string) => {
    try {
      // Chercher l'utilisateur par email
      const q = query(
        collection(db, 'utilisateurs'),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          etat: 'BLOQUE',
          raison_blocage: 'Bloqué après 3 tentatives de connexion échouées',
          date_modification: new Date()
        });
        console.log(`Compte bloqué pour ${email}`);
      }
    } catch (error) {
      console.error('Erreur lors du blocage du compte:', error);
    }
  };

  /**
   * Inscription avec Firebase + Firestore uniquement
   */
  const register = async (email: string, password: string, nom?: string, prenom?: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // Validation côté client
      if (!email || !password) {
        throw new Error('Email et mot de passe requis');
      }
      
      if (password.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }

      // 1. Créer le compte Firebase
      console.log('Création du compte Firebase pour:', email);
      const firebaseResult = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser.value = firebaseResult.user;
      console.log('Compte Firebase créé avec succès, UID:', firebaseResult.user.uid);

      // 2. Créer le profil utilisateur dans Firestore
      console.log('Création du profil Firestore...');
      const profileData: UserProfile = {
        email,
        nom: nom || '',
        prenom: prenom || '',
        role: 'USER',
        etat: 'ACTIF',
        source_auth: 'FIREBASE',
        date_creation: new Date(),
      };

      await setDoc(doc(db, 'utilisateurs', firebaseResult.user.uid), profileData);
      console.log('Profil Firestore créé avec succès');

      // 3. Construire la réponse
      const authResponse: AuthResponse = {
        utilisateur: {
          id_utilisateur: firebaseResult.user.uid,
          email,
          source_auth: 'FIREBASE',
          date_creation: new Date()
        },
        info: {
          nom,
          prenom
        },
        role: {
          code: 'USER'
        },
        etat: {
          code: 'ACTIF'
        },
        firebaseUser: firebaseResult.user
      };

      userProfile.value = authResponse;
      localStorage.setItem('userProfile', JSON.stringify(authResponse));
      console.log('Inscription complète avec succès');

      return authResponse;
    } catch (err: any) {
      console.error('Erreur lors de l\'inscription:', err);
      
      // Messages d'erreur Firebase spécifiques
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (err.code) {
        switch (err.code) {
          case 'auth/configuration-not-found':
            errorMessage = '⚠️ URGENT : Firebase Authentication n\'est PAS activé !\n\n' +
                          '1. Allez sur https://console.firebase.google.com/project/compagnie3127/authentication\n' +
                          '2. Cliquez sur "Get Started" ou "Commencer"\n' +
                          '3. Puis activez Email/Password dans Sign-in method';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'Cet email est déjà utilisé';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Email invalide';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'L\'authentification par email/mot de passe n\'est pas activée. Veuillez activer Email/Password dans Firebase Console.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Mot de passe trop faible (minimum 6 caractères)';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
            break;
          default:
            errorMessage = err.message || 'Erreur lors de l\'inscription';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      error.value = errorMessage;
      
      // Si Firestore échoue mais Firebase réussit, supprimer le compte Firebase
      if (firebaseUser.value && !err.code) {
        try {
          console.log('Suppression du compte Firebase suite à l\'échec Firestore...');
          await firebaseUser.value.delete();
          firebaseUser.value = null;
        } catch (deleteError) {
          console.error('Erreur lors de la suppression du compte Firebase:', deleteError);
        }
      }
      
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  /**
   * Connexion avec Firebase + Firestore uniquement
   */
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    
    try {
      // 1. Vérifier d'abord si le compte existe dans Firestore
      console.log('Vérification du compte pour:', email);
      const q = query(
        collection(db, 'utilisateurs'),
        where('email', '==', email)
      );
      const querySnapshot = await getDocs(q);
      
      // Vérifier si l'utilisateur existe
      if (querySnapshot.empty) {
        console.log('Utilisateur non trouvé dans Firestore');
        
        // Enregistrer la tentative échouée
        await enregistrerTentative(email, null, false);
        
        // Compter les échecs consécutifs
        const echecsConsecutifs = await compterEchecsConsecutifs(email);
        const tentativesRestantes = Math.max(0, MAX_TENTATIVES - echecsConsecutifs);
        
        throw new Error(`Aucun compte trouvé avec cet email. ${tentativesRestantes} tentative(s) restante(s).`);
      }
      
      // L'utilisateur existe, vérifier son état
      const userDoc = querySnapshot.docs[0];
      const profileData = userDoc.data() as UserProfile;
      
      // Corriger l'état du compte si non défini ou invalide
      if (!profileData.etat || (profileData.etat !== 'ACTIF' && profileData.etat !== 'BLOQUE' && profileData.etat !== 'INACTIF')) {
        console.log('État du compte non défini ou invalide, mise à jour vers ACTIF');
        await updateDoc(userDoc.ref, {
          etat: 'ACTIF',
          date_modification: new Date()
        });
        profileData.etat = 'ACTIF';
      }
      
      // Vérifier si le compte est inactif
      if (profileData.etat === 'INACTIF') {
        await enregistrerTentative(email, null, false);
        throw new Error('Votre compte est inactif. Veuillez contacter un administrateur.');
      }
      
      // Si le compte est bloqué, on va essayer la connexion Firebase
      // Si le mot de passe est correct, on débloque automatiquement
      const wasBlocked = profileData.etat === 'BLOQUE';
      
      console.log('Compte trouvé et actif pour:', email);

      // 2. Tenter la connexion à Firebase
      console.log('Connexion à Firebase pour:', email);
      let firebaseResult;
      try {
        firebaseResult = await signInWithEmailAndPassword(auth, email, password);
        firebaseUser.value = firebaseResult.user;
        console.log('Connexion Firebase réussie, UID:', firebaseResult.user.uid);
        
        // Si le compte était bloqué et que le mot de passe est correct, débloquer
        if (wasBlocked) {
          console.log('Compte était bloqué, déblocage automatique car mot de passe correct');
          const updateData: any = {
            etat: 'ACTIF',
            date_modification: new Date()
          };
          // Supprimer le champ raison_blocage en utilisant deleteField
          await updateDoc(userDoc.ref, updateData);
          profileData.etat = 'ACTIF';
        }
      } catch (authError: any) {
        // Mot de passe incorrect ou compte inexistant
        console.log('Échec de connexion Firebase:', authError.code);
        
        // Enregistrer la tentative échouée
        await enregistrerTentative(email, null, false);
        
        // Compter les échecs consécutifs
        const echecsConsecutifs = await compterEchecsConsecutifs(email);
        console.log(`Total échecs consécutifs: ${echecsConsecutifs}`);
        
        // Bloquer le compte si on atteint le maximum
        if (echecsConsecutifs >= MAX_TENTATIVES) {
          // L'utilisateur existe dans Firestore (vérifié au début de la fonction)
          const userId = firebaseResult?.user?.uid || userDoc.id;
          await bloquerCompte(email, userId);
          throw new Error('Compte bloqué après 3 tentatives de connexion échouées. Veuillez contacter un administrateur.');
        }
        
        // Calculer les tentatives restantes
        const tentativesRestantes = MAX_TENTATIVES - echecsConsecutifs;
        
        // Messages d'erreur Firebase spécifiques
        let errorMessage = 'Email ou mot de passe incorrect';
        
        if (authError.code) {
          switch (authError.code) {
            case 'auth/configuration-not-found':
              errorMessage = '⚠️ URGENT : Firebase Authentication n\'est PAS activé !\n\n' +
                            '1. Allez sur https://console.firebase.google.com/project/compagnie3127/authentication\n' +
                            '2. Cliquez sur "Get Started" ou "Commencer"\n' +
                            '3. Puis activez Email/Password dans Sign-in method';
              break;
            case 'auth/invalid-email':
              errorMessage = 'Email invalide';
              break;
            case 'auth/user-disabled':
              errorMessage = 'Ce compte a été désactivé';
              break;
            case 'auth/user-not-found':
              errorMessage = `Email ou mot de passe incorrect. ${tentativesRestantes} tentative(s) restante(s).`;
              break;
            case 'auth/wrong-password':
              errorMessage = `Mot de passe incorrect. ${tentativesRestantes} tentative(s) restante(s).`;
              break;
            case 'auth/invalid-credential':
              errorMessage = `Email ou mot de passe incorrect. ${tentativesRestantes} tentative(s) restante(s).`;
              break;
            case 'auth/network-request-failed':
              errorMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
              break;
            default:
              errorMessage = `${authError.message}. ${tentativesRestantes > 0 ? tentativesRestantes + ' tentative(s) restante(s).' : ''}`;
          }
        }
        
        error.value = errorMessage;
        throw new Error(errorMessage);
      }

      // 3. Connexion Firebase réussie - le profil existe déjà (vérifié au début)
      console.log('Connexion Firebase réussie, profil déjà chargé');

      // 4. Enregistrer la connexion réussie
      await enregistrerTentative(email, firebaseResult.user.uid, true);

      // 5. Construire la réponse
      const authResponse: AuthResponse = {
        utilisateur: {
          id_utilisateur: firebaseResult.user.uid,
          email: firebaseResult.user.email || email,
          source_auth: 'FIREBASE',
          date_creation: profileData.date_creation
        },
        info: {
          nom: profileData.nom,
          prenom: profileData.prenom
        },
        role: {
          code: profileData.role
        },
        etat: {
          code: profileData.etat
        },
        firebaseUser: firebaseResult.user
      };

      userProfile.value = authResponse;
      localStorage.setItem('userProfile', JSON.stringify(authResponse));
      console.log('Connexion complète avec succès');

      return authResponse;
    } catch (err: any) {
      console.error('Erreur lors de la connexion:', err);
      error.value = err.message || 'Erreur lors de la connexion';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Connexion locale (désactivée - Firebase uniquement)
   */
  const loginLocal = async (email: string, password: string) => {
    throw new Error('La connexion locale n\'est pas disponible. Utilisez Firebase.');
  };

  /**
   * Déconnexion Firebase
   */
  const logout = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      await firebaseSignOut(auth);
      firebaseUser.value = null;
      userProfile.value = null;
      localStorage.removeItem('userProfile');
      console.log('Déconnexion réussie');
    } catch (err: any) {
      console.error('Erreur lors de la déconnexion:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Rafraîchir les données utilisateur depuis Firestore
   */
  const refreshUser = async () => {
    if (!firebaseUser.value) {
      throw new Error('Aucun utilisateur connecté');
    }

    loading.value = true;
    error.value = null;
    
    try {
      // Chercher l'utilisateur par email au lieu du UID
      // Car le backend synchronise avec id_utilisateur (PostgreSQL UUID) comme document ID
      const q = query(
        collection(db, 'utilisateurs'),
        where('email', '==', firebaseUser.value.email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Profil utilisateur non trouvé');
      }

      const userDoc = querySnapshot.docs[0];
      const profileData = userDoc.data() as UserProfile;

      const authResponse: AuthResponse = {
        utilisateur: {
          id_utilisateur: firebaseUser.value.uid,
          email: firebaseUser.value.email || '',
          source_auth: 'FIREBASE'
        },
        info: {
          nom: profileData.nom,
          prenom: profileData.prenom
        },
        role: {
          code: profileData.role
        },
        etat: {
          code: profileData.etat
        },
        firebaseUser: firebaseUser.value
      };

      userProfile.value = authResponse;
      localStorage.setItem('userProfile', JSON.stringify(authResponse));
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Mettre à jour les informations utilisateur dans Firestore
   */
  const updateUserInfo = async (nom: string, prenom: string) => {
    if (!firebaseUser.value) {
      throw new Error('Aucun utilisateur connecté');
    }

    loading.value = true;
    error.value = null;
    
    try {
      // Trouver le document par email
      const q = query(
        collection(db, 'utilisateurs'),
        where('email', '==', firebaseUser.value.email)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Profil utilisateur non trouvé');
      }
      
      const userDoc = querySnapshot.docs[0];
      await updateDoc(userDoc.ref, {
        nom,
        prenom,
        date_modification: new Date()
      });

      // Rafraîchir le profil
      await refreshUser();
      
      console.log('Profil mis à jour avec succès');
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour:', err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  const hasRole = (roleCode: 'VISITEUR' | 'USER' | 'MANAGER'): boolean => {
    return userProfile.value?.role?.code === roleCode;
  };

  /**
   * Vérifier si le compte est actif
   */
  const isActive = (): boolean => {
    return userProfile.value?.etat?.code === 'ACTIF';
  };

  return {
    user,
    firebaseUser,
    isAuthenticated,
    error,
    loading,
    register,
    login,
    loginLocal,
    logout,
    refreshUser,
    updateUserInfo,
    hasRole,
    isActive
  };
};
