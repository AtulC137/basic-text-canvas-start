
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVOPP5BP1m9kFLM2jMsiJav2TfO-elcnY",
  authDomain: "savebits-600b5.firebaseapp.com",
  projectId: "savebits-600b5",
  storageBucket: "savebits-600b5.firebasestorage.app",
  messagingSenderId: "155094205996",
  appId: "1:155094205996:web:42bc6a694280b23bc5f389"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
