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
  type QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const useFirestore = (collectionName: string) => {
  const documents = ref<any[]>([]);
  const error = ref<string | null>(null);
  const loading = ref(false);

  const getAll = async (constraints: QueryConstraint[] = []) => {
    loading.value = true;
    error.value = null;
    try {
      const collectionRef = collection(db, collectionName);
      const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;
      const querySnapshot = await getDocs(q);
      documents.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return documents.value;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const create = async (data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data };
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const update = async (id: string, data: any) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const remove = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    documents,
    error,
    loading,
    getAll,
    getById,
    create,
    update,
    remove
  };
};
