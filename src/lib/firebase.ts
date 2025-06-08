
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth'; // Added getAuth

// Configurazione Firebase per il progetto "tempus-concierge"
const firebaseConfig = {
  apiKey: "AIzaSyAN0v1Fq9mDOZ8-9CKlO99o50mCrS6ByiY",
  authDomain: "tempus-concierge.firebaseapp.com",
  projectId: "tempus-concierge", // Confermato come Project ID corretto
  storageBucket: "tempus-concierge.firebasestorage.app",
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
const auth: Auth = getAuth(app); // Initialize Firebase Auth

export { app, db, auth }; // Export auth
