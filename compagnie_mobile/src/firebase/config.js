// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBnzV8trddvn32RUKE5j8QZ-HgKrrWkPsc",
  authDomain: "compagnie3127.firebaseapp.com",
  projectId: "compagnie3127",
  storageBucket: "compagnie3127.firebasestorage.app",
  messagingSenderId: "564439082097",
  appId: "1:564439082097:web:bf1e4df9c2ed1a8d6d27d0",
  measurementId: "G-787TC1FF58"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };
