// src/services/watchService.ts
import type { Watch } from '@/lib/types';
import { watchesData as mockWatchesArray } from '@/lib/mock-data'; // Usa mock data per ora

// TODO: Initialize Firebase and Firestore here or import from a firebase.ts config file
// import { db } from '@/lib/firebase'; // Esempio
// import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'watches';

// Copia locale dei dati mock per simulare un DB in memoria per la sessione
let sessionMockWatches: Watch[] = JSON.parse(JSON.stringify(mockWatchesArray));

// Simula un piccolo ritardo per le chiamate API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getWatches(): Promise<Watch[]> {
  console.log('Servizio: getWatches chiamato');
  // TODO: Sostituire con la chiamata reale a Firestore
  // const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  // const watches = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Watch));
  // return watches;
  await delay(300);
  console.log('Servizio: getWatches restituisce (copia di sessionMockWatches)', sessionMockWatches.length, 'orologi');
  return Promise.resolve([...sessionMockWatches]); // Restituisce una copia per evitare mutazioni esterne dirette
}

export async function getWatchById(id: string): Promise<Watch | null> {
    console.log(`Servizio: getWatchById chiamato per ID: ${id}`);
    await delay(200);
    const watch = sessionMockWatches.find(w => w.id === id);
    // TODO: Sostituire con chiamata Firestore getDoc(doc(db, COLLECTION_NAME, id))
    return Promise.resolve(watch ? {...watch} : null);
}

export async function addWatchService(watchData: Omit<Watch, 'id'>): Promise<Watch> {
  console.log('Servizio: addWatchService chiamato con:', watchData);
  // TODO: Sostituire con la chiamata reale a Firestore
  // const docRef = await addDoc(collection(db, COLLECTION_NAME), watchData);
  // const newWatchWithId = { id: docRef.id, ...watchData };
  await delay(500);
  const newId = `W${Date.now().toString().slice(-5)}${Math.random().toString(36).substring(2, 5)}`;
  const newWatch: Watch = { ...watchData, id: newId };
  sessionMockWatches.push(newWatch);
  console.log('Servizio: addWatchService - orologio aggiunto, nuova lista:', sessionMockWatches.length);
  return Promise.resolve(newWatch);
}

export async function updateWatchService(id: string, watchUpdate: Partial<Omit<Watch, 'id'>>): Promise<Watch | null> {
  console.log(`Servizio: updateWatchService chiamato per ID ${id} con:`, watchUpdate);
  // TODO: Sostituire con la chiamata reale a Firestore
  // const watchRef = doc(db, COLLECTION_NAME, id);
  // await updateDoc(watchRef, watchUpdate);
  // const updatedDocSnap = await getDoc(watchRef);
  // const updatedWatch = updatedDocSnap.exists() ? { id: updatedDocSnap.id, ...updatedDocSnap.data() } as Watch : null;
  await delay(500);
  const index = sessionMockWatches.findIndex(w => w.id === id);
  if (index !== -1) {
    sessionMockWatches[index] = { ...sessionMockWatches[index], ...watchUpdate };
    console.log('Servizio: updateWatchService - orologio aggiornato');
    return Promise.resolve({ ...sessionMockWatches[index] });
  }
  console.log('Servizio: updateWatchService - orologio non trovato per aggiornamento');
  return Promise.resolve(null);
}

export async function deleteWatchService(id: string): Promise<void> {
  console.log(`Servizio: deleteWatchService chiamato per ID ${id}`);
  // TODO: Sostituire con la chiamata reale a Firestore
  // await deleteDoc(doc(db, COLLECTION_NAME, id));
  await delay(500);
  const initialLength = sessionMockWatches.length;
  sessionMockWatches = sessionMockWatches.filter(w => w.id !== id);
  if (sessionMockWatches.length < initialLength) {
    console.log('Servizio: deleteWatchService - orologio eliminato');
  } else {
    console.log('Servizio: deleteWatchService - orologio non trovato per eliminazione');
  }
  return Promise.resolve();
}

// Funzione per resettare i dati mock (utile per testing se necessario)
export async function resetMockDataService(): Promise<void> {
  await delay(100);
  sessionMockWatches = JSON.parse(JSON.stringify(mockWatchesArray));
  console.log('Servizio: Dati mock resettati allo stato iniziale.');
}
