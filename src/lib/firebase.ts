// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATTENZIONE: Sostituisci questi valori con le tue credenziali Firebase!
// Puoi trovarle nella console Firebase > Impostazioni progetto > Generali > Le tue app > Configurazione SDK.
const firebaseConfig = {
  apiKey: "AIzaSyAN0v1Fq9mDOZ8-9CKlO99o50mCrS6ByiY",
  authDomain: "tempus-concierge.firebaseapp.com",
  projectId: "tempus-concierge", // Assicurati che questo sia il Project ID corretto!
  storageBucket: "tempus-concierge.firebasestorage.app",
  messagingSenderId: "544608215639",
  appId: ":544608215639:web:099bf420d083fa9f64f912",
measurementId: "G-3PBXV9TVJG"
  // measurementId: "TUO_MEASUREMENT_ID" // Opzionale, se usi Google Analytics
};

// Inizializza Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

export { app, db };
