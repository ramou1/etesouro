// Configuração do Firebase
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBNwsF9tddanjbdt_dBdWTfzcxXRKlXtzA",
  authDomain: "e-tesouro.firebaseapp.com",
  projectId: "e-tesouro",
  storageBucket: "e-tesouro.firebasestorage.app",
  messagingSenderId: "425308916050",
  appId: "1:425308916050:web:35ea612e8f446776a1d28b"
};



// Inicializar Firebase apenas uma vez
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== 'undefined') {
  // Inicializar Firebase apenas uma vez
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
export default app;

