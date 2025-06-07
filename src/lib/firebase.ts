// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ATTENZIONE: Sostituisci questi valori con le tue credenziali Firebase!
// Puoi trovarle nella console Firebase > Impostazioni progetto > Generali > Le tue app > Configurazione SDK.
const firebaseConfig = {
  apiKey: "TUO_API_KEY",
  authDomain: "TUO_AUTH_DOMAIN",
  projectId: "TUO_PROJECT_ID", // Assicurati che questo sia il Project ID corretto!
  storageBucket: "TUO_STORAGE_BUCKET",
  messagingSenderId: "TUO_MESSAGING_SENDER_ID",
  appId: "TUO_APP_ID",
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
