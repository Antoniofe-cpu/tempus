
// src/services/watchService.ts
import type { Watch, WatchFirestoreData } from '@/lib/types'; 
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  Timestamp, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { watchesData as initialMockWatches } from '@/lib/mock-data';

const COLLECTION_NAME = 'watches';
const watchesCollection = collection(db, COLLECTION_NAME);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fromFirestore = (docSnap: import('firebase/firestore').DocumentSnapshot): Watch => {
  const data = docSnap.data() as WatchFirestoreData; 
  return {
    id: docSnap.id,
    ...data,
    // Convert Timestamps to Dates if they exist and are Timestamps
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  } as Watch; 
};


export async function getWatches(filterOptions?: { isNewArrival?: boolean }): Promise<Watch[]> {
  console.log(`Servizio (Firestore): getWatches chiamato con filtro:`, filterOptions);
  await delay(50);
  try {
    let q;
    if (filterOptions?.isNewArrival === true) {
      q = query(watchesCollection, where('isNewArrival', '==', true), orderBy('createdAt', 'desc'));
    } else {
      q = query(watchesCollection, orderBy('createdAt', 'desc')); 
    }
    const querySnapshot = await getDocs(q);
    const watches = querySnapshot.docs.map(docSnap => {
        const watch = fromFirestore(docSnap);
        // Log per ogni orologio recuperato, specificando isNewArrival e createdAt
        console.log(`Servizio (Firestore) - Orologio letto: ${watch.name}, ID: ${watch.id}, isNewArrival: ${watch.isNewArrival}, Prezzo: ${watch.price}, createdAt: ${watch.createdAt ? new Date(watch.createdAt).toISOString() : 'N/A'}`);
        return watch;
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
            return fromFirestore(docSnap);
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
    const dataToSave: Partial<WatchFirestoreData> = {
      ...watchData,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };
    
    Object.keys(dataToSave).forEach(key => {
      const k = key as keyof Partial<WatchFirestoreData>;
      if (dataToSave[k] === undefined) {
        delete dataToSave[k];
      }
    });
    console.log('Servizio (Firestore): addWatchService - dati pronti per Firestore:', JSON.stringify(dataToSave, null, 2));

    const docRef = await addDoc(watchesCollection, dataToSave);
    const newWatchSnapshot = await getDoc(docRef);
    if (!newWatchSnapshot.exists()) throw new Error("Impossibile recuperare l'orologio appena creato.");
    
    console.log('Servizio (Firestore): addWatchService - orologio aggiunto con ID:', docRef.id);
    return fromFirestore(newWatchSnapshot);
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
    const updateData: Partial<WatchFirestoreData> = { 
        ...watchUpdate,
        updatedAt: serverTimestamp() as Timestamp 
    };
     Object.keys(updateData).forEach(key => {
      const k = key as keyof Partial<WatchFirestoreData>;
      if (updateData[k] === undefined) {
        delete updateData[k];
      }
    });
    console.log('Servizio (Firestore): updateWatchService - dati pronti per Firestore:', JSON.stringify(updateData, null, 2));

    await updateDoc(watchRef, updateData);
    const updatedDocSnap = await getDoc(watchRef);
    if (updatedDocSnap.exists()) {
      console.log('Servizio (Firestore): updateWatchService - orologio aggiornato', updatedDocSnap.id);
      return fromFirestore(updatedDocSnap);
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
    const snapshot = await getDocs(watchesCollection);
    if (snapshot.empty) {
      console.log('COLLEZIONE "watches" VUOTA. Inizio popolamento con dati mock...');
      for (const watch of initialMockWatches) {
        console.log(`--- Popolamento: Tentativo di aggiungere l'orologio: ${watch.name} (ID mock: ${watch.id})`);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...watchData } = watch; 
        const dataToSave: Partial<WatchFirestoreData> = {
          ...watchData, 
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };
        
        Object.keys(dataToSave).forEach(key => {
            if (dataToSave[key as keyof WatchFirestoreData] === undefined) {
                delete dataToSave[key as keyof WatchFirestoreData];
            }
        });
        // Decommentato per debug
        console.log(`--- Popolamento: Dati DA SALVARE per ${watch.name}:`, JSON.stringify(dataToSave, null, 2));
        const docRef = await addDoc(watchesCollection, dataToSave);
        console.log(`--- Popolamento: Orologio "${watch.name}" aggiunto con ID Firestore: ${docRef.id}`);
      }
      console.log('POPOLAMENTO COMPLETATO CON SUCCESSO.');
    } else {
      console.log(`COLLEZIONE "watches" GIA' POPOLATA O CONTIENE DATI (${snapshot.size} documenti trovati). Popolamento saltato.`);
    }
  } catch (error) {
    console.error("ERRORE DURANTE IL POPOLAMENTO DI FIRESTORE con dati mock:", error);
  }
}
