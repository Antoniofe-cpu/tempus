
// src/services/serviceCardService.ts
import { db, storage } from '@/lib/firebase'; // Importa storage
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import per funzioni di storage
import type { ServiceCard } from '@/lib/types'; // Assumendo che ServiceCard sia in types.ts

const COLLECTION_NAME = 'serviceCards';

// Default service card data
const defaultServiceCards: Omit<ServiceCard, 'id'>[] = [
  {
    title: 'Compra',
    description: 'Trova il tuo prossimo orologio da sogno.',
    link: '/shop',
    iconUrl: '', // Inizialmente vuoto o un placeholder se preferisci
  },
  {
    title: 'Vendi',
    description: 'Valuta e vendi il tuo orologio con facilità.',
    link: '/vendi',
    iconUrl: '',
  },
  {
    title: 'Cerca',
    description: 'Richiedi una ricerca personalizzata per un pezzo raro.',
    link: '/richiesta-personalizzata',
    iconUrl: '',
  },
  {
    title: 'Ripara',
    description: 'Affidati ai nostri esperti per la cura del tuo orologio.',
    link: '/ripara',
    iconUrl: '',
  },
];


// Helper to convert Firestore document to ServiceCard object
const serviceCardConverter = {
  toFirestore(card: Omit<ServiceCard, 'id'>): DocumentData { // Modificato per accettare Omit<ServiceCard, 'id'>
    return card;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ServiceCard { // Rimosso options che non era usato
    const data = snapshot.data()!;
    return {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      iconUrl: data.iconUrl,
      link: data.link,
    };
  },
};

export async function populateServiceCardsIfNeeded(): Promise<void> {
  try {
    const serviceCardsCollection = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(serviceCardsCollection);
    if (snapshot.empty) {
      console.log('Collection "serviceCards" empty. Populating with default data...');
      for (const cardData of defaultServiceCards) {
        await addDoc(serviceCardsCollection, cardData);
      }
      console.log('Service card population complete.');
    } else {
      // console.log('Collection "serviceCards" already populated.');
    }
  } catch (error) {
    console.error("Error populating service cards in Firestore:", error);
    // Non rilanciare l'errore qui, è una funzione di setup
  }
}

export async function getServiceCards(): Promise<ServiceCard[]> {
  // console.log('Service (Firestore): getServiceCards called');
  try {
    await populateServiceCardsIfNeeded(); 
    const serviceCardsCollection = collection(db, COLLECTION_NAME).withConverter(serviceCardConverter);
    const querySnapshot = await getDocs(serviceCardsCollection);
    const serviceCards = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
    // console.log('Service (Firestore): getServiceCards returns', serviceCards.length, 'cards');
    return serviceCards;
  } catch (error) {
    console.error("Error in getServiceCards (Firestore): ", error);
    // throw error; // Rimosso il re-throw
    return []; // Restituisce un array vuoto in caso di errore
  }
}

// Funzione per caricare l'icona del servizio su Firebase Storage
export async function uploadServiceIcon(file: File): Promise<string> {
  try {
    // Crea un nome univoco per il file, ad es. usando timestamp + nome originale
    const fileName = `service-icons/${Date.now()}-${file.name}`;
    const storageRef = ref(storage, fileName);

    // Carica il file
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Uploaded a blob or file!', snapshot);

    // Ottieni l'URL di download
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('File available at', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading service icon to Firebase Storage:", error);
    throw new Error(`Impossibile caricare l'icona del servizio: ${(error as Error).message}`);
  }
}


export async function updateServiceCard(id: string, serviceCardUpdate: Partial<Omit<ServiceCard, 'id'>>): Promise<void> {
  // console.log(`Service (Firestore): updateServiceCard called for ID ${id} with:`, JSON.stringify(serviceCardUpdate, null, 2));
  try {
    const serviceCardRef = doc(db, COLLECTION_NAME, id); // Non usare .withConverter qui se serviceCardUpdate è parziale
    await updateDoc(serviceCardRef, serviceCardUpdate);
    // console.log('Service (Firestore): updateServiceCard - card updated');
  } catch (error) {
    console.error(`Error in updateServiceCard (Firestore) for ID ${id}: `, error);
    throw error;
  }
}

