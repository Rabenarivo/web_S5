import { ref } from 'vue';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../firebase/config';

const user = ref<User | null>(null);
const error = ref<string | null>(null);
const loading = ref(false);

// Monitor authentication state
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser;
});

export const useAuth = () => {
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      user.value = result.user;
      return result;
    } catch (err: any) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };



  return {
    user,
    error,
    loading,
    login
  };
};
