
// src/services/serviceCardService.ts
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore';

export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  iconUrl?: string; // Optional icon/image URL
  link: string;
}

const COLLECTION_NAME = 'serviceCards';

// Default service card data - Rimosso iconUrl per usare fallback
const defaultServiceCards: Omit<ServiceCard, 'id'>[] = [
  {
    title: 'Compra',
    description: 'Trova il tuo prossimo orologio da sogno.',
    link: '/shop',
  },
  {
    title: 'Vendi',
    description: 'Valuta e vendi il tuo orologio con facilità.',
    link: '/vendi',
  },
  {
    title: 'Cerca',
    description: 'Richiedi una ricerca personalizzata per un pezzo raro.',
    link: '/richiesta-personalizzata',
  },
  {
    title: 'Ripara',
    description: 'Affidati ai nostri esperti per la cura del tuo orologio.',
    link: '/ripara',
  },
];


// Helper to convert Firestore document to ServiceCard object
const serviceCardConverter = {
  toFirestore(card: ServiceCard): DocumentData {
    // Exclude id when saving to Firestore as it's the doc ID
    const { id, ...data } = card;
    return data;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options: any): ServiceCard {
    const data = snapshot.data(options)!;
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
      console.log('Collection "serviceCards" already populated.');
    }
  } catch (error) {
    console.error("Error populating service cards in Firestore:", error);
  }
}

export async function getServiceCards(): Promise<ServiceCard[]> {
  console.log('Service (Firestore): getServiceCards called');
  await populateServiceCardsIfNeeded(); // Ensure default data exists
  try {
    const serviceCardsCollection = collection(db, COLLECTION_NAME).withConverter(serviceCardConverter);
    const querySnapshot = await getDocs(serviceCardsCollection);
    const serviceCards = querySnapshot.docs.map(docSnapshot => docSnapshot.data());
    console.log('Service (Firestore): getServiceCards returns', serviceCards.length, 'cards');
    return serviceCards;
  } catch (error) {
    console.error("Error in getServiceCards (Firestore): ", error);
    throw error;
  }
}

export async function updateServiceCard(id: string, serviceCardUpdate: Partial<Omit<ServiceCard, 'id'>>): Promise<void> {
  console.log(`Service (Firestore): updateServiceCard called for ID ${id} with:`, JSON.stringify(serviceCardUpdate, null, 2));
  try {
    const serviceCardRef = doc(db, COLLECTION_NAME, id).withConverter(serviceCardConverter);
    await updateDoc(serviceCardRef, serviceCardUpdate);
    console.log('Service (Firestore): updateServiceCard - card updated');
  } catch (error) {
    console.error(`Error in updateServiceCard (Firestore) for ID ${id}: `, error);
    throw error;
  }
}
