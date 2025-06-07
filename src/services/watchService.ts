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
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { watchesData as initialMockWatches } from '@/lib/mock-data'; // Per la funzione di ripopolamento

const COLLECTION_NAME = 'watches';

// Simula un piccolo ritardo per le chiamate API (puoi rimuoverlo o regolarlo)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function getWatches(): Promise<Watch[]> {
  console.log('Servizio (Firestore): getWatches chiamato');
  await delay(100); // Simula latenza di rete
  try {
    const watchesCollection = collection(db, COLLECTION_NAME);
    // Ordina per un campo, ad esempio 'name' o 'brand', o aggiungi un campo 'createdAt' per ordinare per data di inserimento
    // Per ora, non ordiniamo specificamente, Firestore restituirà in base all'ID del documento o all'ordine di inserimento (non garantito)
    // Potresti voler aggiungere un campo 'createdAt: Timestamp' al tuo tipo Watch e ordinarlo per quello.
    // const q = query(watchesCollection, orderBy("brand")); 
    const querySnapshot = await getDocs(watchesCollection);
    const watches = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        // Eventuali conversioni di tipo, es. Timestamp di Firestore a Date JS
        // createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), 
      } as Watch;
    });
    console.log('Servizio (Firestore): getWatches restituisce', watches.length, 'orologi');
    return watches;
  } catch (error) {
    console.error("Errore in getWatches (Firestore): ", error);
    throw error; // Rilancia l'errore per gestirlo nel componente
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
                // createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
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
  console.log('Servizio (Firestore): addWatchService chiamato con:', watchData);
  await delay(100);
  try {
    // Prepara i dati, assicurandoti che non ci siano campi undefined che Firestore non gradisce
    const dataToSave = { ...watchData };
    Object.keys(dataToSave).forEach(key => {
      if (dataToSave[key as keyof typeof dataToSave] === undefined) {
        delete dataToSave[key as keyof typeof dataToSave];
      }
    });
    // Aggiungi un timestamp se non presente (opzionale, ma utile)
    // if (!dataToSave.createdAt) {
    //   (dataToSave as any).createdAt = Timestamp.now();
    // }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), dataToSave);
    const newWatchWithId: Watch = { id: docRef.id, ...watchData } as Watch; // Cast perché watchData è Omit<Watch, 'id'>
    console.log('Servizio (Firestore): addWatchService - orologio aggiunto con ID:', docRef.id);
    return newWatchWithId;
  } catch (error) {
    console.error("Errore in addWatchService (Firestore): ", error);
    throw error;
  }
}

export async function updateWatchService(id: string, watchUpdate: Partial<Omit<Watch, 'id'>>): Promise<Watch | null> {
  console.log(`Servizio (Firestore): updateWatchService chiamato per ID ${id} con:`, watchUpdate);
  await delay(100);
  try {
    const watchRef = doc(db, COLLECTION_NAME, id);
    // Prepara i dati per l'aggiornamento, rimuovendo eventuali campi undefined
    const updateData = { ...watchUpdate };
     Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });
    // Aggiungi un timestamp di aggiornamento se vuoi
    // (updateData as any).updatedAt = Timestamp.now();

    await updateDoc(watchRef, updateData);
    const updatedDocSnap = await getDoc(watchRef);
    if (updatedDocSnap.exists()) {
      const data = updatedDocSnap.data();
      console.log('Servizio (Firestore): updateWatchService - orologio aggiornato');
      return { 
        id: updatedDocSnap.id, 
        ...data 
        // createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
        // updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
      } as Watch;
    }
    return null; // Non dovrebbe succedere se updateDoc non fallisce e l'ID è corretto
  } catch (error) {
    console.error(`Errore in updateWatchService (Firestore) per ID ${id}: `, error);
    throw error;
  }
}

export async function deleteWatchService(id: string): Promise<void> {
  console.log(`Servizio (Firestore): deleteWatchService chiamato per ID ${id}`);
  await delay(100);
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    console.log('Servizio (Firestore): deleteWatchService - orologio eliminato');
  } catch (error) {
    console.error(`Errore in deleteWatchService (Firestore) per ID ${id}: `, error);
    throw error;
  }
}

// Funzione per popolare Firestore con i dati mock se la collezione è vuota
// Questa è una funzione di utilità, potresti volerla chiamare manualmente o tramite un'interfaccia admin dedicata
export async function populateFirestoreWithMockDataIfNeeded(): Promise<void> {
  try {
    const watchesCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(watchesCollection);
    if (snapshot.empty) {
      console.log('Collezione "watches" vuota. Popolamento con dati mock...');
      for (const watch of initialMockWatches) {
        const { id, ...watchData } = watch; // Rimuovi l'ID mock se vuoi che Firestore ne generi uno nuovo
                                           // o usa l'ID mock se vuoi mantenerlo (ma assicurati che siano unici)
        // In questo caso, usiamo addDoc per generare nuovi ID, ignorando gli ID mock
        await addDoc(watchesCollection, watchData); 
      }
      console.log('Popolamento completato.');
    } else {
      console.log('Collezione "watches" già popolata.');
    }
  } catch (error) {
    console.error("Errore durante il popolamento di Firestore con dati mock:", error);
  }
}
