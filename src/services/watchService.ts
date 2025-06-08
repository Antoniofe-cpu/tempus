
// src/services/watchService.ts
import type { Watch } from '@/lib/types';
import { db } from '@/lib/firebase'; // Importa l'istanza db da firebase.ts
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc,
  // query, // Non usato attualmente, rimosso per pulizia
  // orderBy, // Non usato attualmente, rimosso per pulizia
  // Timestamp // Non usato attualmente, rimosso per pulizia
} from 'firebase/firestore';
import { watchesData as initialMockWatches } from '@/lib/mock-data'; // Per la funzione di ripopolamento

const COLLECTION_NAME = 'watches';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

import { query, where } from 'firebase/firestore';

export async function getWatches(isNewArrival?: boolean): Promise<Watch[]> {
  console.log(`Servizio (Firestore): getWatches chiamato${isNewArrival === true ? ' filtrando per Nuovi Arrivi' : ''}`);
  await delay(50);
  try {
    const watchesCollection = collection(db, COLLECTION_NAME);
    let q = watchesCollection as any; // Start with the base collection reference

    if (isNewArrival === true) {
      q = query(watchesCollection, where('isNewArrival', '==', true));
    }
    const querySnapshot = await getDocs(q);
    const watches = querySnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
      } as Watch;
    });
    console.log('Servizio (Firestore): getWatches restituisce', watches.length, 'orologi');
    return watches;
  } catch (error) {
    console.error("Errore in getWatches (Firestore): ", error);
    throw error; 
  }
}

export async function getWatchById(id: string): Promise<Watch | null> {
    console.log(`Servizio (Firestore): getWatchById chiamato per ID: ${id}`);
    await delay(50);
    try {
        const watchDocRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(watchDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data
            } as Watch;
        } else {
            console.log(`Servizio (Firestore): Nessun orologio trovato con ID: ${id}`);
            return null;
        }
    } catch (error) {
        console.error(`Errore in getWatchById (Firestore) per ID ${id}: `, error);
        throw error;
    }
}

export async function addWatchService(watchData: Omit<Watch, 'id'>): Promise<Watch> {
  console.log('Servizio (Firestore): addWatchService chiamato con (originale):', JSON.stringify(watchData, null, 2));
  await delay(50);
  try {
    // Prepara i dati, assicurandoti che non ci siano campi undefined che Firestore non gradisce
    // e convertendo stringhe vuote per campi opzionali in undefined se Firestore li gestisce meglio così,
    // oppure mantenendoli come stringhe vuote se è accettabile.
    // Firestore ignorerà i campi undefined. Stringhe vuote verranno salvate.
    const dataToSave: Record<string, any> = { ...watchData };
    
    Object.keys(dataToSave).forEach(key => {
      const k = key as keyof Omit<Watch, 'id'>;
      if (dataToSave[k] === undefined) {
        delete dataToSave[k];
      }
      // Se un campo opzionale è una stringa vuota e preferisci non salvarlo, gestiscilo qui.
      // Esempio: if (k === 'rarity' && dataToSave[k] === '') delete dataToSave[k];
      // Per ora, le stringhe vuote per rarity, condition, dataAiHint verranno salvate come tali.
    });
    console.log('Servizio (Firestore): addWatchService - dati pronti per Firestore:', JSON.stringify(dataToSave, null, 2));

    const docRef = await addDoc(watchesCollection, dataToSave);
    const newWatch: Watch = { id: docRef.id, ...(watchData as Watch) }; // Ricostruisci l'oggetto con l'id
    console.log('Servizio (Firestore): addWatchService - orologio aggiunto con ID:', docRef.id);
    return newWatch;
  } catch (error) {
    console.error("Errore DETTAGLIATO in addWatchService (Firestore): ", error);
    throw error;
  }
}

export async function updateWatchService(id: string, watchUpdate: Partial<Omit<Watch, 'id'>>): Promise<Watch | null> {
  console.log(`Servizio (Firestore): updateWatchService chiamato per ID ${id} con (originale):`, JSON.stringify(watchUpdate, null, 2));
  await delay(50);
  try {
    const watchRef = doc(db, COLLECTION_NAME, id);
    const updateData: Record<string, any> = { ...watchUpdate };
     Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    console.log('Servizio (Firestore): updateWatchService - dati pronti per Firestore:', JSON.stringify(updateData, null, 2));

    await updateDoc(watchRef, updateData);
    const updatedDocSnap = await getDoc(watchRef);
    if (updatedDocSnap.exists()) {
      const data = updatedDocSnap.data();
      console.log('Servizio (Firestore): updateWatchService - orologio aggiornato', updatedDocSnap.id);
      return {
        id: updatedDocSnap.id,
        ...data
      } as Watch;
    }
    return null; 
  } catch (error) {
    console.error(`Errore DETTAGLIATO in updateWatchService (Firestore) per ID ${id}: `, error);
    throw error;
  }
}

export async function deleteWatchService(id: string): Promise<void> {
  console.log(`Servizio (Firestore): deleteWatchService chiamato per ID ${id}`);
  await delay(50);
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log('Servizio (Firestore): deleteWatchService - orologio eliminato');
  } catch (error) {
    console.error(`Errore DETTAGLIATO in deleteWatchService (Firestore) per ID ${id}: `, error);
    throw error;
  }
}

export async function populateFirestoreWithMockDataIfNeeded(): Promise<void> {
  try {
    const watchesCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(watchesCollection);
    if (snapshot.empty) {
      console.log('Collezione "watches" vuota. Popolamento con dati mock...');
      for (const watch of initialMockWatches) {
        const { id, ...watchData } = watch;
        // Assicurati che i dati mock non abbiano undefined
        const dataToSave: Record<string, any> = { ...watchData };
        Object.keys(dataToSave).forEach(key => {
            if (dataToSave[key] === undefined) {
                delete dataToSave[key];
            }
        });
        await addDoc(watchesCollection, dataToSave);
      }
      console.log('Popolamento completato.');
    } else {
      console.log('Collezione "watches" già popolata.');
    }
  } catch (error) {
    console.error("Errore durante il popolamento di Firestore con dati mock:", error);
  }
}

    