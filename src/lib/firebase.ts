
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage'; // Aggiunto import per Storage

// Configurazione Firebase per il progetto "tempus-concierge"
// IMPORTANTE: Verifica che apiKey sia quella corretta del tuo progetto Firebase.
// L'errore auth/configuration-not-found spesso dipende da una apiKey errata
// o dal provider Email/Password non abilitato nella console Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyAN0v1Fq9mDOZ8-9CKlO99o50mCrS6ByiY", // Chiave fornita dall'utente
  authDomain: "tempus-concierge.firebaseapp.com",
  projectId: "tempus-concierge",
  storageBucket: "tempus-concierge.appspot.com", // Assicurati che sia il bucket corretto, spesso è nomeprogetto.appspot.com
  messagingSenderId: "544608215639",
  appId: "1:544608215639:web:099bf420d083fa9f64f912",
  // measurementId: "G-XXXXXXXXXX" // Opzionale, se usi Google Analytics
};

// Inizializza Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app); // Inizializza Firebase Storage

export { app, db, auth, storage }; // Esporta storage
